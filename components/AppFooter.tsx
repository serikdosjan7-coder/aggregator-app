"use client"

import { useI18n } from "@/lib/i18n"

export function AppFooter() {
  const { t } = useI18n()

  return (
    <footer style={{
      borderTop: "1px solid #1A1A1A",
      padding: "24px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      background: "#000000",
    }}>
      {/* Divider accent */}
      <div style={{ width: 32, height: 1, background: "#8B0000", marginBottom: 8 }} />

      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#8B0000", textTransform: "uppercase" }}>
        RideHub
      </p>

      <p style={{ fontSize: 11, color: "#333333", letterSpacing: "0.06em", textAlign: "center" }}>
        {t.profile.footer_powered}
      </p>

      <p style={{ fontSize: 11, color: "#333333", letterSpacing: "0.06em", textAlign: "center" }}>
        {t.profile.footer_dev}
      </p>

      <p style={{ fontSize: 10, color: "#222222", letterSpacing: "0.08em", marginTop: 4, textTransform: "uppercase" }}>
        &copy; 2026 Almaty, Kazakhstan
      </p>
    </footer>
  )
}
