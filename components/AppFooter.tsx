"use client"

import { useI18n } from "@/lib/i18n"

export function AppFooter() {
  const { t } = useI18n()

  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "24px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      background: "#040507",
    }}>
      {/* Divider accent */}
      <div style={{ width: 32, height: 1, background: "#e8002b", marginBottom: 8 }} />

      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#e8002b", textTransform: "uppercase" }}>
        RideHub
      </p>

      <p style={{ fontSize: 11, color: "#8895a5", letterSpacing: "0.06em", textAlign: "center" }}>
        {t.profile.footer_powered}
      </p>

      <p style={{ fontSize: 11, color: "#8895a5", letterSpacing: "0.06em", textAlign: "center" }}>
        {t.profile.footer_dev}
      </p>

      <p style={{ fontSize: 10, color: "#8895a5", letterSpacing: "0.08em", marginTop: 4, textTransform: "uppercase" }}>
        &copy; 2026 Almaty, Kazakhstan
      </p>
    </footer>
  )
}
