"use client"

import { useState, useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"

interface TransportRow {
  id: string
  name: string
  type: string
  battery: number
  status: "available" | "booked" | "maintenance"
  provider: string
  price_per_hour: number
  lat?: number
  lng?: number
}

const MOCK: TransportRow[] = [
  { id:"1",  name:"Xiaomi Pro 2",    type:"scooter", battery:82,  status:"available",   provider:"ScootAlmaty", price_per_hour:800,  lat:43.2389, lng:76.8897 },
  { id:"2",  name:"Segway E45",      type:"ebike",   battery:61,  status:"booked",      provider:"BikeCity",    price_per_hour:600,  lat:43.2420, lng:76.8950 },
  { id:"3",  name:"Trek FX 3",       type:"bike",    battery:100, status:"available",   provider:"ScootAlmaty", price_per_hour:400,  lat:43.2350, lng:76.8840 },
  { id:"4",  name:"Honda Dio 110",   type:"moped",   battery:45,  status:"maintenance", provider:"MotoRent",    price_per_hour:1200, lat:43.2460, lng:76.9010 },
  { id:"5",  name:"Ninebot Max G30", type:"scooter", battery:33,  status:"available",   provider:"BikeCity",    price_per_hour:900,  lat:43.2310, lng:76.8960 },
  { id:"6",  name:"Cube Reaction",   type:"ebike",   battery:78,  status:"available",   provider:"ScootAlmaty", price_per_hour:1000, lat:43.2400, lng:76.8820 },
  { id:"7",  name:"Kugoo S3 Pro",    type:"scooter", battery:91,  status:"booked",      provider:"RideKZ",      price_per_hour:750,  lat:43.2480, lng:76.8870 },
  { id:"8",  name:"Giant Escape 3",  type:"bike",    battery:100, status:"available",   provider:"BikeCity",    price_per_hour:350,  lat:43.2330, lng:76.9050 },
  { id:"9",  name:"Razor E300",      type:"scooter", battery:15,  status:"available",   provider:"ScootAlmaty", price_per_hour:700,  lat:43.2360, lng:76.8910 },
  { id:"10", name:"Xiaomi Mi 3",     type:"scooter", battery:8,   status:"available",   provider:"RideKZ",      price_per_hour:750,  lat:43.2410, lng:76.8930 },
]

const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A0A0A0" }
const card: React.CSSProperties = { background: "#121212", border: "1px solid #1A1A1A", borderRadius: 4 }

function getBatteryTier(pct: number): "critical" | "low" | "good" {
  if (pct < 20) return "critical"
  if (pct < 40) return "low"
  return "good"
}

function BatteryHealth({ pct, labels }: {
  pct: number
  labels: { critical: string; low: string; good: string; needs_charging: string }
}) {
  const tier  = getBatteryTier(pct)
  const color = tier === "critical" ? "#8B0000" : tier === "low" ? "#A0A0A0" : "#FFFFFF"

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: "#1A1A1A", borderRadius: 2, minWidth: 60 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 34, textAlign: "right" }}>{pct}%</span>
      {tier === "critical" && (
        <span style={{ padding: "2px 7px", background: "#1A0000", border: "1px solid #3A0000", borderRadius: 4, fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B0000", whiteSpace: "nowrap" }}>
          ! {labels.needs_charging}
        </span>
      )}
      {tier === "low" && (
        <span style={{ padding: "2px 7px", background: "#111111", border: "1px solid #2A2A2A", borderRadius: 4, fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A0A0A0", whiteSpace: "nowrap" }}>
          {labels.low}
        </span>
      )}
    </div>
  )
}

function StatusBadge({ status, labels }: {
  status: TransportRow["status"]
  labels: { available: string; booked: string; maintenance: string }
}) {
  const map = {
    available:   { color: "#FFFFFF", bg: "#0A2A0A", border: "#1A3A1A", label: labels.available },
    booked:      { color: "#8B0000", bg: "#1A0000", border: "#3A0000", label: labels.booked },
    maintenance: { color: "#A0A0A0", bg: "#1A1A1A", border: "#2A2A2A", label: labels.maintenance },
  }
  const s = map[status]
  return (
    <span style={{ padding: "3px 8px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: s.color }}>
      {s.label}
    </span>
  )
}

export default function FleetPage() {
  const { t } = useI18n()
  const [fleet,        setFleet]        = useState<TransportRow[]>(MOCK)
  const [loading,      setLoading]      = useState(true)
  const [editId,       setEditId]       = useState<string | null>(null)
  const [editPrice,    setEditPrice]    = useState("")
  const [saving,       setSaving]       = useState(false)
  const [toast,        setToast]        = useState<string | null>(null)
  const [filterHealth, setFilterHealth] = useState<"all" | "critical" | "low" | "good">("all")

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.from("transport").select("*").order("battery").then(({ data, error }) => {
      if (!error && data && data.length > 0) setFleet(data as TransportRow[])
      setLoading(false)
    })
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function savePrice(id: string) {
    const price = parseInt(editPrice, 10)
    if (isNaN(price) || price < 0) return
    setSaving(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from("transport").update({ price_per_hour: price }).eq("id", id)
    if (!error) { setFleet(prev => prev.map(v => v.id === id ? { ...v, price_per_hour: price } : v)); showToast(t.admin.price_updated) }
    setEditId(null); setSaving(false)
  }

  const batteryLabels = { critical: t.admin.badge_critical, low: t.admin.badge_low, good: t.admin.badge_good, needs_charging: t.admin.badge_needs_charging }
  const statusLabels  = { available: t.admin.status_available, booked: t.admin.status_booked, maintenance: t.admin.status_maintenance }

  const critical = fleet.filter(v => getBatteryTier(v.battery) === "critical")
  const filtered = fleet.filter(v => filterHealth === "all" || getBatteryTier(v.battery) === filterHealth)

  function pillStyle(active: boolean): React.CSSProperties {
    return {
      padding: "5px 12px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      border: "1px solid", borderColor: active ? "#8B0000" : "#1A1A1A",
      background: active ? "#0A0000" : "#0A0A0A",
      color: active ? "#FFFFFF" : "#A0A0A0",
      cursor: "pointer", transition: "border-color 150ms, color 150ms", fontFamily: "inherit",
    }
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <p style={{ ...lbl, marginBottom: 6 }}>{t.admin.fleet_management}</p>
        <h1 className="heading-auto" style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 700 }}>
          {t.admin.fleet_title}
        </h1>
        <p style={{ fontSize: 13, color: "#A0A0A0", marginTop: 6 }}>
          {loading ? t.admin.loading : `${fleet.length} ${t.admin.fleet_vehicles_registry}`}
        </p>
      </div>

      {/* Critical battery alert banner */}
      {critical.length > 0 && (
        <div style={{ padding: "14px 20px", marginBottom: 24, background: "#0A0000", border: "1px solid #8B0000", borderRadius: 4, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#8B0000", textTransform: "uppercase" }}>
            ! {critical.length} {t.admin.badge_needs_charging}
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {critical.map(v => (
              <span key={v.id} style={{ padding: "3px 10px", background: "#1A0000", border: "1px solid #3A0000", borderRadius: 4, fontSize: 11, color: "#FFFFFF" }}>
                {v.name} - {v.battery}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Health filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "critical", "low", "good"] as const).map(h => (
          <button key={h} onClick={() => setFilterHealth(h)} style={pillStyle(filterHealth === h)}>
            {h === "all" ? t.admin.filter_all_status : t.admin[`badge_${h}` as keyof typeof t.admin]}
            {h === "critical" && critical.length > 0 && (
              <span style={{ marginLeft: 6, background: "#8B0000", color: "#FFFFFF", borderRadius: 2, padding: "0 4px", fontSize: 9 }}>
                {critical.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Fleet table */}
      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2.5fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid #1A1A1A", minWidth: 680 }}>
          {[t.admin.col_name, t.admin.col_type, t.admin.col_status, t.admin.col_health, t.admin.col_rate, t.admin.col_coordinates].map(col => (
            <p key={col} style={{ ...lbl, marginBottom: 0 }}>{col}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#A0A0A0" }}>{t.admin.no_vehicles}</p>
          </div>
        ) : filtered.map((v, i) => {
          const isCritical = getBatteryTier(v.battery) === "critical"
          return (
            <div key={v.id} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2.5fr 1fr 1fr",
              padding: "14px 20px",
              borderBottom: i < filtered.length - 1 ? "1px solid #1A1A1A" : "none",
              alignItems: "center", minWidth: 680,
              background: isCritical ? "rgba(139,0,0,0.04)" : "transparent",
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{v.name}</p>
                <p style={{ fontSize: 11, color: "#A0A0A0", marginTop: 2 }}>{v.provider}</p>
              </div>
              <p style={{ fontSize: 11, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{v.type}</p>
              <StatusBadge status={v.status} labels={statusLabels} />
              <div style={{ paddingRight: 12 }}>
                <BatteryHealth pct={v.battery} labels={batteryLabels} />
              </div>
              <div>
                {editId === v.id ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                      style={{ width: 70, padding: "4px 8px", background: "#0A0A0A", border: "1px solid #8B0000", borderRadius: 4, color: "#FFFFFF", fontSize: 12, outline: "none", fontFamily: "inherit" }}
                      autoFocus />
                    <button onClick={() => savePrice(v.id)} disabled={saving}
                      style={{ padding: "4px 8px", background: "#8B0000", border: "none", borderRadius: 4, color: "#FFFFFF", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                      {saving ? "..." : t.admin.btn_save}
                    </button>
                    <button onClick={() => setEditId(null)}
                      style={{ padding: "4px 8px", background: "transparent", border: "1px solid #1A1A1A", borderRadius: 4, color: "#A0A0A0", fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      X
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setEditId(v.id); setEditPrice(String(v.price_per_hour)) }}
                    style={{ background: "transparent", border: "none", color: "#FFFFFF", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                    {v.price_per_hour.toLocaleString("ru-RU")} <span style={{ fontSize: 10, color: "#A0A0A0" }}>[edit]</span>
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11, color: "#A0A0A0", fontVariantNumeric: "tabular-nums" }}>
                {v.lat && v.lng ? `${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}` : "-"}
              </p>
            </div>
          )
        })}
      </div>

      {/* Battery health summary */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid #1A1A1A", borderRadius: 4, overflow: "hidden" }}>
        {([
          { tier: "critical", label: t.admin.badge_critical, color: "#8B0000", count: fleet.filter(v => getBatteryTier(v.battery) === "critical").length },
          { tier: "low",      label: t.admin.badge_low,      color: "#A0A0A0", count: fleet.filter(v => getBatteryTier(v.battery) === "low").length },
          { tier: "good",     label: t.admin.badge_good,     color: "#FFFFFF", count: fleet.filter(v => getBatteryTier(v.battery) === "good").length },
        ]).map((s, i) => (
          <div key={s.tier} style={{ ...card, borderRadius: 0, border: "none", borderRight: i < 2 ? "1px solid #1A1A1A" : "none", padding: "16px 20px" }}>
            <p style={{ ...lbl, marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.count}</p>
            <div style={{ marginTop: 10, height: 2, background: "#1A1A1A" }}>
              <div style={{ width: fleet.length ? `${s.count / fleet.length * 100}%` : "0%", height: "100%", background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 1000, padding: "8px 20px", background: "#121212", border: "1px solid #1A1A1A", borderRadius: 4, color: "#FFFFFF", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </>
  )
}
