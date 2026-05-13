"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"

interface OperatorRow {
  id: string
  email: string
  created_at: string
  role: string
  last_sign_in_at?: string
}

const card: React.CSSProperties = { background: "#121212", border: "1px solid #1A1A1A", borderRadius: 4 }

const MOCK_OPERATORS: OperatorRow[] = [
  { id: "1", email: "admin@ridehub.kz",     created_at: "2025-01-01", role: "admin",    last_sign_in_at: "2026-05-12" },
  { id: "2", email: "operator1@ridehub.kz", created_at: "2025-02-14", role: "operator", last_sign_in_at: "2026-05-10" },
  { id: "3", email: "operator2@ridehub.kz", created_at: "2025-03-20", role: "operator", last_sign_in_at: "2026-05-08" },
  { id: "4", email: "test@example.com",     created_at: "2025-04-01", role: "user",     last_sign_in_at: "2026-04-30" },
]

export default function OperatorsPage() {
  const { t } = useI18n()
  const [operators] = useState<OperatorRow[]>(MOCK_OPERATORS)

  const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A0A0A0" }

  function formatDate(dateStr: string) {
    try { return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }
    catch { return dateStr }
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <p style={{ ...lbl, marginBottom: 6 }}>{t.admin.operators_label}</p>
        <h1 className="heading-auto" style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 700 }}>
          {t.admin.operators_title}
        </h1>
        <p style={{ fontSize: 13, color: "#A0A0A0", marginTop: 6 }}>
          {operators.length} {t.admin.operators_count}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1, border: "1px solid #1A1A1A", borderRadius: 4, overflow: "hidden", marginBottom: 24 }}>
        {[
          { label: t.admin.stat_total,     value: operators.length },
          { label: t.admin.stat_admins,    value: operators.filter(o => o.role === "admin").length },
          { label: t.admin.stat_operators, value: operators.filter(o => o.role === "operator").length },
          { label: t.admin.stat_users,     value: operators.filter(o => o.role === "user").length },
        ].map((s, i) => (
          <div key={s.label} style={{ ...card, borderRadius: 0, border: "none", borderRight: i < 3 ? "1px solid #1A1A1A" : "none", padding: "16px 20px" }}>
            <p style={{ ...lbl, marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid #1A1A1A", minWidth: 480 }}>
          {[t.admin.col_email, t.admin.col_role, t.admin.col_registered, t.admin.col_last_active].map(col => (
            <p key={col} style={{ ...lbl, marginBottom: 0 }}>{col}</p>
          ))}
        </div>
        {operators.map((op, i) => (
          <div key={op.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < operators.length - 1 ? "1px solid #1A1A1A" : "none", alignItems: "center", minWidth: 480 }}>
            <p style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}>{op.email}</p>
            <span style={{ display: "inline-block", padding: "3px 8px", background: op.role === "admin" ? "#1A0000" : "#0A0A0A", border: `1px solid ${op.role === "admin" ? "#8B0000" : "#1A1A1A"}`, borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: op.role === "admin" ? "#8B0000" : "#A0A0A0", width: "fit-content" }}>
              {op.role}
            </span>
            <p style={{ fontSize: 12, color: "#A0A0A0" }}>{formatDate(op.created_at)}</p>
            <p style={{ fontSize: 12, color: "#A0A0A0" }}>{op.last_sign_in_at ? formatDate(op.last_sign_in_at) : "-"}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: "14px 16px", background: "#0A0000", border: "1px solid #1A0000", borderRadius: 4 }}>
        <p style={{ fontSize: 11, color: "#A0A0A0", lineHeight: 1.6 }}>
          <strong style={{ color: "#8B0000" }}>Note:</strong> {t.admin.operators_note}
        </p>
      </div>
    </>
  )
}
