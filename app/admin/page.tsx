"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Truck, BarChart2, Bell, Users, ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface TransportRow {
  id: string
  name: string
  type: "scooter" | "ebike" | "bike" | "moped"
  battery: number
  status: "available" | "booked" | "maintenance"
  provider: string
  price_per_hour: number
}

const MOCK_FLEET: TransportRow[] = [
  { id:"1", name:"Xiaomi Pro 2",    type:"scooter", battery:82,  status:"available",   provider:"ScootAlmaty", price_per_hour:800  },
  { id:"2", name:"Segway E45",      type:"ebike",   battery:61,  status:"booked",      provider:"BikeCity",    price_per_hour:600  },
  { id:"3", name:"Trek FX 3",       type:"bike",    battery:100, status:"available",   provider:"ScootAlmaty", price_per_hour:400  },
  { id:"4", name:"Honda Dio 110",   type:"moped",   battery:45,  status:"maintenance", provider:"MotoRent",    price_per_hour:1200 },
  { id:"5", name:"Ninebot Max G30", type:"scooter", battery:33,  status:"available",   provider:"BikeCity",    price_per_hour:900  },
  { id:"6", name:"Cube Reaction",   type:"ebike",   battery:78,  status:"available",   provider:"ScootAlmaty", price_per_hour:1000 },
  { id:"7", name:"Kugoo S3 Pro",    type:"scooter", battery:91,  status:"booked",      provider:"RideKZ",      price_per_hour:750  },
  { id:"8", name:"Giant Escape 3",  type:"bike",    battery:100, status:"available",   provider:"BikeCity",    price_per_hour:350  },
]

const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A0A0A0" }
const card: React.CSSProperties = { background: "rgba(15,17,21,0.75)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4 }

export default function AdminDashboard() {
  const { t } = useI18n()
  const [fleet, setFleet] = useState<TransportRow[]>(MOCK_FLEET)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"supabase" | "mock">("mock")

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.from("transport").select("id,name,type,battery,status,provider,price_per_hour").order("name")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) { setFleet(data as TransportRow[]); setSource("supabase") }
        setLoading(false)
      })
  }, [])

  const total      = fleet.length
  const available  = fleet.filter(v => v.status === "available").length
  const booked     = fleet.filter(v => v.status === "booked").length
  const avgBattery = total ? Math.round(fleet.reduce((s, v) => s + v.battery, 0) / total) : 0
  const critical   = fleet.filter(v => v.battery < 20).length

  const QUICK_LINKS = [
    { href: "/admin/fleet",     icon: Truck,     label: t.admin.nav_fleet,     sub: `${total} vehicles` },
    { href: "/admin/analytics", icon: BarChart2, label: t.admin.nav_analytics, sub: "Performance metrics" },
    { href: "/admin/support",   icon: Bell,      label: t.admin.nav_support,   sub: critical > 0 ? `${critical} critical` : "All clear" },
    { href: "/admin/operators", icon: Users,     label: t.admin.nav_operators, sub: "User management" },
  ]

  return (
    <>
      {/* Bleed hero */}
      <div style={{
        margin: "-32px -28px 40px",
        padding: "48px 28px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.3,
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "#e8002b" }} />
        <div style={{ position: "relative" }}>
          <p style={{ ...lbl, color: "#e8002b", marginBottom: 12 }}>{t.admin.dashboard_label}</p>
          <h1 className="heading-auto" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.05, marginBottom: 16 }}>
            {t.admin.dashboard_title}
          </h1>
          <p style={{ fontSize: 13, color: "#A0A0A0" }}>
            {loading ? t.admin.loading : source === "supabase" ? t.admin.live_data : t.admin.demo_data}
            {critical > 0 && (
              <span style={{ marginLeft: 16, color: "#e8002b", fontWeight: 700 }}>
                ! {critical} {t.admin.badge_needs_charging}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden", marginBottom: 40 }}>
        {[
          { label: t.admin.stat_total_fleet,  value: total,            sub: t.admin.stat_vehicles_registered },
          { label: t.admin.stat_available,    value: available,        sub: `${total ? Math.round(available/total*100) : 0}${t.admin.stat_of_fleet}`, accent: true },
          { label: t.admin.stat_active_rides, value: booked,           sub: t.admin.stat_currently_booked },
          { label: t.admin.stat_avg_battery,  value: `${avgBattery}%`, sub: t.admin.stat_fleet_average },
        ].map((s, i) => (
          <div key={s.label} style={{ ...card, borderRadius: 0, border: "none", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none", padding: "20px 24px" }}>
            <p style={{ ...lbl, marginBottom: 10 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.accent ? "#e8002b" : "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: "#A0A0A0" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick-access cards */}
      <p style={{ ...lbl, marginBottom: 16 }}>Quick Access</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden", marginBottom: 40 }}>
        {QUICK_LINKS.map(({ href, icon: Icon, label, sub }, i) => (
          <Link key={href} href={href} style={{
            ...card, borderRadius: 0, border: "none",
            borderRight: i < QUICK_LINKS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            padding: "24px 20px", textDecoration: "none",
            display: "flex", flexDirection: "column", gap: 12,
            transition: "background-color 150ms",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#1A1A1A")}
          onMouseLeave={e => (e.currentTarget.style.background = "#121212")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Icon size={18} strokeWidth={1.5} color="#e8002b" />
              <ArrowRight size={12} strokeWidth={1.5} color="#A0A0A0" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 11, color: "#A0A0A0" }}>{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Fleet type breakdown */}
      <p style={{ ...lbl, marginBottom: 16 }}>Fleet Breakdown</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
        {(["scooter", "ebike", "bike", "moped"] as const).map((type, i) => {
          const count = fleet.filter(v => v.type === type).length
          const avail = fleet.filter(v => v.type === type && v.status === "available").length
          const pct   = count ? Math.round(avail / count * 100) : 0
          return (
            <div key={type} style={{ ...card, borderRadius: 0, border: "none", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none", padding: "20px 20px" }}>
              <p style={{ ...lbl, marginBottom: 8 }}>{{scooter:"Taycan Scooter",ebike:"E-Tron Bike",bike:"Bike",moped:"Urban Moped"}[type]}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{count}</p>
              <p style={{ fontSize: 11, color: "#A0A0A0", marginTop: 4 }}>{avail} {t.admin.breakdown_available}</p>
              <div style={{ marginTop: 12, height: 2, background: "#1A1A1A" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#e8002b" }} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
