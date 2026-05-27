"use client"

import { useState, useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { DollarSign, Activity, TrendingUp, Server } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface TransportRow {
  id: string
  type: string
  battery: number
  status: string
  price_per_hour: number
}

const MOCK_FLEET: TransportRow[] = [
  { id:"1", type:"scooter", battery:82,  status:"available",   price_per_hour:800  },
  { id:"2", type:"ebike",   battery:61,  status:"booked",      price_per_hour:600  },
  { id:"3", type:"bike",    battery:100, status:"available",   price_per_hour:400  },
  { id:"4", type:"moped",   battery:45,  status:"maintenance", price_per_hour:1200 },
  { id:"5", type:"scooter", battery:33,  status:"available",   price_per_hour:900  },
  { id:"6", type:"ebike",   battery:78,  status:"available",   price_per_hour:1000 },
  { id:"7", type:"scooter", battery:91,  status:"booked",      price_per_hour:750  },
  { id:"8", type:"bike",    battery:100, status:"available",   price_per_hour:350  },
]

const RIDES_PER_DAY = [
  { day: "Mon", rides: 42 },
  { day: "Tue", rides: 58 },
  { day: "Wed", rides: 51 },
  { day: "Thu", rides: 67 },
  { day: "Fri", rides: 89 },
  { day: "Sat", rides: 103 },
  { day: "Sun", rides: 76 },
]

const REVENUE_BY_TYPE = [
  { type: "scooter", revenue: 124800, color: "#8B0000" },
  { type: "ebike",   revenue: 89400,  color: "#A0A0A0" },
  { type: "bike",    revenue: 42000,  color: "#FFFFFF" },
  { type: "moped",   revenue: 67200,  color: "#333333" },
]

const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A0A0A0" }
const card: React.CSSProperties = { background: "#121212", border: "1px solid #1A1A1A", borderRadius: 4 }

export default function AnalyticsPage() {
  const { t } = useI18n()
  const [fleet, setFleet] = useState<TransportRow[]>(MOCK_FLEET)
  const [loading, setLoading] = useState(true)
  const [realUserCount, setRealUserCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    // Load fleet data
    supabase.from("transport").select("id,type,battery,status,price_per_hour").then(({ data, error }) => {
      if (!error && data && data.length > 0) setFleet(data as TransportRow[])
      setLoading(false)
    })

    // Load real user count — tries profiles table, falls back to users table
    const fetchUserCount = async () => {
      // Try profiles table (most common Supabase pattern)
      const { count: profilesCount, error: profilesErr } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
      if (!profilesErr && profilesCount !== null) {
        setRealUserCount(profilesCount)
        return
      }
      // Fallback: try users table
      const { count: usersCount, error: usersErr } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
      if (!usersErr && usersCount !== null) {
        setRealUserCount(usersCount)
      }
      // If both fail — keep null, will show mock value
    }
    fetchUserCount()
  }, [])

  const totalFleetValue = fleet.reduce((s, v) => s + v.price_per_hour * 8 * 30, 0)
  const activeRides     = fleet.filter(v => v.status === "booked").length
  const userGrowth      = realUserCount !== null ? realUserCount : 247
  const uptime          = "99.9%"

  const maxRevenue = Math.max(...REVENUE_BY_TYPE.map(r => r.revenue))
  const totalRevenue = REVENUE_BY_TYPE.reduce((s, r) => s + r.revenue, 0)

  const batteryBuckets = [
    { label: "0-20%",   count: fleet.filter(v => v.battery <= 20).length,                    color: "#8B0000" },
    { label: "21-40%",  count: fleet.filter(v => v.battery > 20 && v.battery <= 40).length,  color: "#555555" },
    { label: "41-60%",  count: fleet.filter(v => v.battery > 40 && v.battery <= 60).length,  color: "#888888" },
    { label: "61-80%",  count: fleet.filter(v => v.battery > 60 && v.battery <= 80).length,  color: "#AAAAAA" },
    { label: "81-100%", count: fleet.filter(v => v.battery > 80).length,                     color: "#FFFFFF" },
  ]
  const maxBucket = Math.max(...batteryBuckets.map(b => b.count), 1)

  /* SVG line chart helpers */
  function buildLinePath(data: { rides: number }[], w: number, h: number, pad: number): string {
    const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - pad * 2))
    const min = Math.min(...data.map(d => d.rides))
    const max = Math.max(...data.map(d => d.rides))
    const range = max - min || 1
    const ys = data.map(d => h - pad - ((d.rides - min) / range) * (h - pad * 2))
    return xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ")
  }

  const LINE_W = 500
  const LINE_H = 120
  const LINE_PAD = 20
  const linePath = buildLinePath(RIDES_PER_DAY, LINE_W, LINE_H, LINE_PAD)

  const lineDots = RIDES_PER_DAY.map((d, i) => {
    const x = LINE_PAD + (i / (RIDES_PER_DAY.length - 1)) * (LINE_W - LINE_PAD * 2)
    const min = Math.min(...RIDES_PER_DAY.map(r => r.rides))
    const max = Math.max(...RIDES_PER_DAY.map(r => r.rides))
    const range = max - min || 1
    const y = LINE_H - LINE_PAD - ((d.rides - min) / range) * (LINE_H - LINE_PAD * 2)
    return { x, y, rides: d.rides, day: d.day }
  })

  const KPI = [
    { label: t.admin.stat_fleet_value,  value: `${(totalFleetValue / 1000).toFixed(0)}K`, sub: t.admin.stat_fleet_value_sub,  icon: DollarSign, accent: true },
    { label: t.admin.stat_active_rides, value: activeRides,                                sub: t.admin.stat_active_rides_sub, icon: Activity },
    { label: t.admin.stat_user_growth,  value: userGrowth,                                 sub: realUserCount !== null ? t.admin.stat_user_growth_live ?? "registered users" : t.admin.stat_user_growth_sub,  icon: TrendingUp },
    { label: t.admin.stat_uptime,       value: uptime,                                     sub: t.admin.stat_uptime_sub,       icon: Server },
  ]

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <p style={{ ...lbl, marginBottom: 6 }}>{t.admin.analytics_label}</p>
        <h1 className="heading-auto" style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 700 }}>
          {t.admin.analytics_title}
        </h1>
        <p style={{ fontSize: 13, color: "#A0A0A0", marginTop: 6 }}>{t.admin.analytics_subtitle}</p>
      </div>

      {/* 4 KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, border: "1px solid #1A1A1A", borderRadius: 4, overflow: "hidden", marginBottom: 40 }}>
        {KPI.map((k, i) => (
          <div key={k.label} style={{ ...card, borderRadius: 0, border: "none", borderRight: i < 3 ? "1px solid #1A1A1A" : "none", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={lbl}>{k.label}</p>
              <k.icon size={14} strokeWidth={1.5} color={k.accent ? "#8B0000" : "#A0A0A0"} />
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: k.accent ? "#8B0000" : "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6 }}>
              {loading ? "-" : k.value}
            </p>
            <p style={{ fontSize: 11, color: "#A0A0A0" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: "1px solid #1A1A1A", borderRadius: 4, overflow: "hidden", marginBottom: 24 }}>

        {/* SVG Line chart — Weekly Rides Trend */}
        <div style={{ ...card, borderRadius: 0, border: "none", borderRight: "1px solid #1A1A1A", padding: "24px 24px 20px" }}>
          <p style={{ ...lbl, marginBottom: 4 }}>{t.admin.line_chart_label}</p>
          <p style={{ fontSize: 11, color: "#A0A0A0", marginBottom: 16 }}>{t.admin.rides_label}</p>

          {/* SVG chart */}
          <div style={{ width: "100%", overflowX: "hidden" }}>
            <svg
              viewBox={`0 0 ${LINE_W} ${LINE_H}`}
              style={{ width: "100%", height: "auto", display: "block" }}
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                <line
                  key={frac}
                  x1={LINE_PAD} y1={LINE_PAD + frac * (LINE_H - LINE_PAD * 2)}
                  x2={LINE_W - LINE_PAD} y2={LINE_PAD + frac * (LINE_H - LINE_PAD * 2)}
                  stroke="#1A1A1A" strokeWidth="1"
                />
              ))}

              {/* Area fill under the line */}
              <path
                d={`${linePath} L${(LINE_W - LINE_PAD).toFixed(1)},${(LINE_H - LINE_PAD).toFixed(1)} L${LINE_PAD},${(LINE_H - LINE_PAD).toFixed(1)} Z`}
                fill="rgba(139,0,0,0.08)"
              />

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#8B0000"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Dots + value labels */}
              {lineDots.map((dot) => (
                <g key={dot.day}>
                  <circle cx={dot.x} cy={dot.y} r="4" fill="#8B0000" />
                  <circle cx={dot.x} cy={dot.y} r="2" fill="#FFFFFF" />
                  <text
                    x={dot.x}
                    y={dot.y - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#A0A0A0"
                    fontFamily="inherit"
                  >
                    {dot.rides}
                  </text>
                  <text
                    x={dot.x}
                    y={LINE_H - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#A0A0A0"
                    fontFamily="inherit"
                  >
                    {dot.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Revenue by type */}
        <div style={{ ...card, borderRadius: 0, border: "none", padding: "24px 24px 20px" }}>
          <p style={{ ...lbl, marginBottom: 20 }}>{t.admin.revenue_label}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {REVENUE_BY_TYPE.map(r => (
              <div key={r.type}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A0A0A0" }}>{r.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>
                    {(r.revenue / 1000).toFixed(0)}K
                    <span style={{ fontSize: 9, color: "#A0A0A0", marginLeft: 4 }}>
                      {Math.round(r.revenue / totalRevenue * 100)}%
                    </span>
                  </span>
                </div>
                <div style={{ height: 3, background: "#1A1A1A" }}>
                  <div style={{ width: `${r.revenue / maxRevenue * 100}%`, height: "100%", background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Battery distribution */}
      <div style={{ ...card, padding: "24px 24px 20px" }}>
        <p style={{ ...lbl, marginBottom: 20 }}>{t.admin.battery_label}</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 80 }}>
          {batteryBuckets.map(b => (
            <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: "#A0A0A0" }}>{b.count}</span>
              <div style={{ width: "100%", background: b.color, height: `${(b.count / maxBucket) * 60}px`, borderRadius: "2px 2px 0 0", minHeight: b.count > 0 ? 4 : 0 }} />
              <span style={{ fontSize: 9, color: "#A0A0A0", textAlign: "center", lineHeight: 1.2 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
