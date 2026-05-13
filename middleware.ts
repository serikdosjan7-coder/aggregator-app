import { NextResponse, type NextRequest } from "next/server"

// Routes that require authentication
const PROTECTED_ROUTES = ["/map", "/profile", "/bookings"]

// Public routes — never redirect
const PUBLIC_ROUTES = ["/", "/auth", "/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Skip static assets and Next.js internals ────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  // ── 2. Skip public routes — never redirect ─────────────────────────────
  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.next()
  }

  // ── 3. Only enforce auth on protected routes ───────────────────────────
  const isProtected = PROTECTED_ROUTES.some(
    r => pathname === r || pathname.startsWith(r + "/")
  )
  if (!isProtected) {
    return NextResponse.next()
  }

  // ── 4. Check for Supabase session cookie (no network call) ─────────────
  // Supabase stores the session in a cookie named sb-<project>-auth-token
  // We check for its presence without making a network request to avoid
  // timeouts and infinite redirect loops.
  const hasSession = request.cookies.getAll().some(
    c => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  )

  // ── 5. No session cookie → redirect to /auth ──────────────────────────
  if (!hasSession) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/auth"
    redirectUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ── 6. Session cookie present → allow through ─────────────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
