"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Truck, BarChart2, Bell, Users, ArrowLeft, Menu, X } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"
import { LangSwitcher } from "@/components/LangSwitcher"

const NAV_ITEMS = [
  { href: "/admin",           icon: LayoutDashboard, key: "nav_dashboard" as const },
  { href: "/admin/fleet",     icon: Truck,           key: "nav_fleet"     as const },
  { href: "/admin/analytics", icon: BarChart2,       key: "nav_analytics" as const },
  { href: "/admin/support",   icon: Bell,            key: "nav_support"   as const },
  { href: "/admin/operators", icon: Users,           key: "nav_operators" as const },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { t }    = useI18n()

  const [checking,    setChecking]    = useState(true)
  const [allowed,     setAllowed]     = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) { router.replace("/auth"); return }
      const role = user.user_metadata?.role ?? user.app_metadata?.role ?? ""
      if (role === "admin") { setAllowed(true) }
      else { router.replace("/map") }
      setChecking(false)
    })
  }, [router])

  if (checking) {
    return (
      <div style={{ height: "100vh", background: "#040507", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    )
  }
  if (!allowed) return null

  return (
    <div style={{ minHeight: "100vh", background: "#040507", color: "#FFFFFF", display: "flex" }}>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 199 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: "#040507",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, bottom: 0, left: 0,
        zIndex: 200,
      }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "#e8002b", textTransform: "uppercase" }}>
            {t.admin.wordmark}
          </p>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px",
                  borderRadius: 4,
                  background: active ? "#0A0000" : "transparent",
                  border: `1px solid ${active ? "#e8002b" : "transparent"}`,
                  color: active ? "#FFFFFF" : "#A0A0A0",
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "color 150ms, border-color 150ms, background-color 150ms",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "#1A1A1A" } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#A0A0A0"; e.currentTarget.style.borderColor = "transparent" } }}
              >
                <Icon size={14} strokeWidth={1.5} />
                {t.admin[key]}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: "12px 12px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
          <LangSwitcher />
          <Link href="/map" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 12px",
            background: "rgba(15,17,21,0.75)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 4,
            color: "#A0A0A0", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            textDecoration: "none",
            transition: "border-color 150ms, color 150ms",
          }}>
            <ArrowLeft size={12} strokeWidth={1.5} />
            {t.admin.back_to_map}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 220, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Mobile top bar */}
        <div style={{
          display: "none",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          alignItems: "center", justifyContent: "space-between",
        }} className="admin-mobile-bar">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#e8002b", textTransform: "uppercase" }}>
            {t.admin.wordmark}
          </p>
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", padding: 4 }}
          >
            {sidebarOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>

        <main style={{ flex: 1, padding: "32px 28px", maxWidth: 1100, width: "100%" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { transform: translateX(-100%); transition: transform 150ms; }
          .admin-mobile-bar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
