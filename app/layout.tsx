import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "./error-boundary"
import { I18nProvider } from "@/lib/i18n"
import { ThemeProvider } from "@/lib/theme"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "RideHub — Urban Velocity. Refined.",
  description: "One platform. Every scooter in Almaty. Zero noise.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RideHub",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#040507",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${inter.variable} h-full antialiased bg-[#040507]`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#040507] text-white">
        <I18nProvider>
          <ThemeProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}