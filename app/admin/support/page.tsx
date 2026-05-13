"use client"

import { useState, useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"

type AlertStatus = "open" | "pending" | "resolved"
type AlertType   = "battery" | "maintenance" | "booking" | "system"

interface SystemAlert {
  id: string
  type: AlertType
  vehicle: string
  message: string
  time: string
  status: AlertStatus
}

const MOCK_ALERTS: SystemAlert[] = [
  { id: "ALT-001", type: "battery",     vehicle: "Xiaomi Mi 3",     message: "Battery critically low - 8%. Immediate charging required.",     time: "2 min ago",  status: "open"     },
  { id: "ALT-002", type: "battery",     vehicle: "Razor E300",      message: "Battery at 15%. Vehicle may not complete active ride.",         time: "5 min ago",  status: "open"     },
  { id: "ALT-003", type: "maintenance", vehicle: "Honda Dio 110",   message: "Scheduled maintenance overdue by 3 days.",                      time: "1 hr ago",   status: "pending"  },
  { id: "ALT-004", type: "booking",     vehicle: "Segway E45",      message: "Booking timer expired - vehicle not returned to zone.",         time: "2 hr ago",   status: "open"     },
  { id: "ALT-005", type: "system",      vehicle: "-",               message: "Supabase realtime connection dropped. Reconnecting...",         time: "3 hr ago",   status: "pending"  },
  { id: "ALT-006", type: "battery",     vehicle: "Ninebot Max G30", message: "Battery at 33%. Recommend charging before next booking.",       time: "4 hr ago",   status: "pending"  },
  { id: "ALT-007", type: "maintenance", vehicle: "Trek FX 3",       message: "Brake inspection flagged by operator.",                         time: "6 hr ago",   status: "resolved" },
  { id: "ALT-008", type: "booking",     vehicle: "Kugoo S3 Pro",    message: "Booking cancelled mid-ride. Refund processing.",               time: "8 hr ago",   status: "resolved" },
]

const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A0A0A0" }
const card: React.CSSProperties = { background: "#121212", border: "1px solid #1A1A1A", borderRadius: 4 }

export default function SupportPage() {
  const { t } = useI18n()
  const [alerts,       setAlerts]       = useState<SystemAlert[]>(MOCK_ALERTS)
  const [filterStatus, setFilterStatus] = useState<"all" | AlertStatus>("all")
  const [filterType,   setFilterType]   = useState<"all" | AlertType>("all")
  const [toast,        setToast]        = useState<string | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase
      .from("rides")
      .select("id, vehicle_name, issue_type, issue_message, created_at, issue_status")
      .not("issue_type", "is", null)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: SystemAlert[] = data.map(row => ({
            id:      `ALT-${String(row.id).slice(0, 6)}`,
            type:    (row.issue_type ?? "system") as AlertType,
            vehicle: row.vehicle_name ?? "-",
            message: row.issue_message ?? "No details.",
            time:    new Date(row.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            status:  (row.issue_status ?? "open") as AlertStatus,
          }))
          setAlerts(mapped)
        }
      })
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  function resolveAlert(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "resolved" } : a))
    showToast(`${id} resolved.`)
  }

  function dismissAlert(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id))
    showToast(`${id} dismissed.`)
  }

  const filtered = alerts
    .filter(a => filterStatus === "all" || a.status === filterStatus)
    .filter(a => filterType   === "all" || a.type   === filterType)

  const openCount    = alerts.filter(a => a.status === "open").length
  const pendingCount = alerts.filter(a => a.status === "pending").length

  function statusColor(s: AlertStatus) {
    return s === "open" ? "#8B0000" : s === "pending" ? "#A0A0A0" : "#FFFFFF"
  }
  function statusLabel(s: AlertStatus) {
    return s === "open" ? t.admin.alert_status_open : s === "pending" ? t.admin.alert_status_pending : t.admin.alert_status_resolved
  }
  function typeLabel(tp: AlertType) {
    return tp === "battery" ? t.admin.alert_type_battery : tp === "maintenance" ? t.admin.alert_type_maintenance : tp === "booking" ? t.admin.alert_type_booking : t.admin.alert_type_system
  }

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
        <p style={{ ...lbl, marginBottom: 6 }}>{t.admin.support_label}</p>
        <h1 className="heading-auto" style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 700 }}>
          {t.admin.support_title}
        </h1>
        <p style={{ fontSize: 13, color: "#A0A0A0", marginTop: 6 }}>{t.admin.support_subtitle}</p>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid #1A1A1A", borderRadius: 4, overflow: "hidden", marginBottom: 28 }}>
        {[
          { label: t.admin.alert_status_open,    value: openCount,    color: "#8B0000" },
          { label: t.admin.alert_status_pending, value: pendingCount, color: "#A0A0A0" },
          { label: t.admin.alert_status_resolved,value: alerts.filter(a => a.status === "resolved").length, color: "#FFFFFF" },
        ].map((s, i) => (
          <div key={s.label} style={{ ...card, borderRadius: 0, border: "none", borderRight: i < 2 ? "1px solid #1A1A1A" : "none", padding: "16px 20px" }}>
            <p style={{ ...lbl, marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "open", "pending", "resolved"] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={pillStyle(filterStatus === s)}>
            {s === "all" ? t.admin.filter_all_status : statusLabel(s as AlertStatus)}
          </button>
        ))}
        <div style={{ width: 1, background: "#1A1A1A" }} />
        {(["all", "battery", "maintenance", "booking", "system"] as const).map(tp => (
          <button key={tp} onClick={() => setFilterType(tp)} style={pillStyle(filterType === tp)}>
            {tp === "all" ? t.admin.filter_all_types : typeLabel(tp as AlertType)}
          </button>
        ))}
      </div>

      {/* Alerts table */}
      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 3fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid #1A1A1A", minWidth: 700 }}>
          {[t.admin.alert_col_id, t.admin.alert_col_type, t.admin.alert_col_vehicle, t.admin.alert_col_message, t.admin.alert_col_time, t.admin.alert_col_status, t.admin.col_action].map(col => (
            <p key={col} style={{ ...lbl, marginBottom: 0 }}>{col}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#A0A0A0" }}>{t.admin.no_alerts}</p>
          </div>
        ) : filtered.map((a, i) => (
          <div key={a.id} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 3fr 1fr 1fr 1fr",
            padding: "14px 20px",
            borderBottom: i < filtered.length - 1 ? "1px solid #1A1A1A" : "none",
            alignItems: "center", minWidth: 700,
            background: a.status === "open" ? "rgba(139,0,0,0.03)" : "transparent",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#A0A0A0", fontVariantNumeric: "tabular-nums" }}>{a.id}</p>
            <span style={{ display: "inline-block", padding: "3px 8px", background: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A0A0A0", width: "fit-content" }}>
              {typeLabel(a.type)}
            </span>
            <p style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 500 }}>{a.vehicle}</p>
            <p style={{ fontSize: 12, color: "#A0A0A0", lineHeight: 1.5, paddingRight: 12 }}>{a.message}</p>
            <p style={{ fontSize: 11, color: "#A0A0A0" }}>{a.time}</p>
            <span style={{
              display: "inline-block", padding: "3px 8px",
              background: a.status === "open" ? "#1A0000" : a.status === "pending" ? "#111111" : "#0A0A0A",
              border: `1px solid ${a.status === "open" ? "#3A0000" : "#1A1A1A"}`,
              borderRadius: 4, fontSize: 9, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: statusColor(a.status), width: "fit-content",
            }}>
              {statusLabel(a.status)}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {a.status !== "resolved" && (
                <button onClick={() => resolveAlert(a.id)} style={{ padding: "4px 8px", background: "transparent", border: "1px solid #1A3A1A", borderRadius: 4, color: "#FFFFFF", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", transition: "border-color 150ms" }}>
                  {t.admin.btn_resolve}
                </button>
              )}
              <button onClick={() => dismissAlert(a.id)} style={{ padding: "4px 8px", background: "transparent", border: "1px solid #2A2A2A", borderRadius: 4, color: "#A0A0A0", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", transition: "border-color 150ms" }}>
                {t.admin.btn_dismiss}
              </button>
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
