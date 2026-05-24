import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

const PROTECTED = ["/dashboard", "/vehicles", "/profile"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only check protected routes
  if (!PROTECTED.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL("/auth", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/vehicles/:path*", "/profile/:path*"],
}
