"use client"

import { useState } from "react"
import { Settings, X, Sun, Moon, Lock, LogOut, ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useTheme } from "@/lib/theme"
import { LangSwitcher } from "@/components/LangSwitcher"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Props {
  /** Render as icon-only trigger button (for sidebars) or full inline block */
  variant?: "trigger" | "inline"
}

export function SettingsPanel({ variant = "trigger" }: Props) {
  const { t } = useI18n()
  const { theme, toggle } = useTheme()
  const router = useRouter()

  const [open,          setOpen]          = useState(false)
  const [changingPwd,   setChangingPwd]   = useState(false)
  const [pwdSent,       setPwdSent]       = useState(false)
  const [loggingOut,    setLoggingOut]    = useState(false)

  const isDark = theme === "dark"

  /* ── Send password-reset email ── */
  async function handleChangePassword() {
    setChangingPwd(true)
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email
    if (email) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
    }
    setChangingPwd(false)
    setPwdSent(true)
    setTimeout(() => setPwdSent(false), 4000)
  }

  /* ── Sign out ── */
  async function handleSignOut() {
    setLoggingOut(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/auth")
  }

  /* ── Shared styles ── */
  const panelBg    = isDark ? "#121212" : "#FFFFFF"
  const panelBdr   = isDark ? "#2A2A2A" : "#E4E4E7"
  const textPri    = isDark ? "#FFFFFF" : "#09090B"
  const textMuted  = isDark ? "#A0A0A0" : "#71717A"
  const rowHover   = isDark ? "#1A1A1A" : "#F4F4F5"
  const lbl: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
    textTransform: "uppercase", color: textMuted,
  }

  const panel = (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
    }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 420,
          background: panelBg,
          border: `1px solid ${panelBdr}`,
          borderRadius: "12px 12px 0 0",
          padding: "0 0 32px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: panelBdr }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: textPri, letterSpacing: "0.04em" }}>
            {t.settings?.title ?? "Настройки"}
          </p>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, padding: 4 }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Language ── */}
        <div style={{ padding: "0 20px 16px", borderBottom: `1px solid ${panelBdr}` }}>
          <p style={{ ...lbl, marginBottom: 10 }}>{t.settings?.lang ?? "Тіл / Язык / Language"}</p>
          <LangSwitcher />
        </div>

        {/* ── Theme ── */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${panelBdr}` }}>
          <p style={{ ...lbl, marginBottom: 12 }}>{t.settings?.theme ?? "Интерфейс тақырыбы"}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["dark", "light"] as const).map(th => {
              const active = theme === th
              return (
                <button
                  key={th}
                  onClick={() => toggle()}
                  style={{
                    flex: 1, padding: "12px 8px",
                    background: active ? (isDark ? "#1A1A1A" : "#F4F4F5") : "transparent",
                    border: `1px solid ${active ? "#e8002b" : panelBdr}`,
                    borderRadius: 8,
                    color: active ? textPri : textMuted,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    transition: "border-color 150ms",
                  }}
                >
                  {th === "dark"
                    ? <Moon size={18} strokeWidth={1.5} color={active ? "#e8002b" : textMuted} />
                    : <Sun  size={18} strokeWidth={1.5} color={active ? "#e8002b" : textMuted} />
                  }
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {th === "dark"
                      ? (t.settings?.theme_dark  ?? "Cyberpunk Dark")
                      : (t.settings?.theme_light ?? "Light Mode")
                    }
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Security ── */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${panelBdr}` }}>
          <p style={{ ...lbl, marginBottom: 10 }}>{t.settings?.security ?? "Қауіпсіздік"}</p>

          <button
            onClick={handleChangePassword}
            disabled={changingPwd || pwdSent}
            style={{
              width: "100%", padding: "12px 16px",
              background: "transparent",
              border: `1px solid ${panelBdr}`,
              borderRadius: 8,
              color: pwdSent ? "#22C55E" : textPri,
              fontSize: 13, fontWeight: 600,
              cursor: changingPwd || pwdSent ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              fontFamily: "inherit", transition: "border-color 150ms",
            }}
            onMouseEnter={e => { if (!pwdSent) e.currentTarget.style.borderColor = "#e8002b" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = panelBdr }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Lock size={15} strokeWidth={1.5} color={pwdSent ? "#22C55E" : "#e8002b"} />
              {pwdSent
                ? (t.settings?.pwd_sent    ?? "Сілтеме жіберілді ✓")
                : changingPwd
                  ? (t.settings?.pwd_sending ?? "Жіберілуде...")
                  : (t.settings?.change_pwd  ?? "Парольді өзгерту")
              }
            </div>
            {!pwdSent && <ChevronRight size={14} strokeWidth={1.5} color={textMuted} />}
          </button>
        </div>

        {/* ── Sign out ── */}
        <div style={{ padding: "16px 20px 0" }}>
          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            style={{
              width: "100%", padding: "12px 16px",
              background: "transparent",
              border: "1px solid rgba(232,0,43,0.3)",
              borderRadius: 8,
              color: "#e8002b",
              fontSize: 13, fontWeight: 700,
              cursor: loggingOut ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit", letterSpacing: "0.06em", textTransform: "uppercase",
              opacity: loggingOut ? 0.6 : 1,
              transition: "border-color 150ms",
            }}
            onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.borderColor = "#e8002b" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(232,0,43,0.3)" }}
          >
            <LogOut size={15} strokeWidth={1.5} />
            {loggingOut ? (t.profile.signing_out) : (t.profile.btn_signout)}
          </button>
        </div>
      </div>
    </div>
  )

  if (variant === "inline") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", width: "100%",
            borderRadius: 4,
            background: "transparent",
            border: "1px solid transparent",
            color: "#A0A0A0",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "inherit",
            transition: "color 150ms, border-color 150ms",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "#1A1A1A" }}
          onMouseLeave={e => { e.currentTarget.style.color = "#A0A0A0"; e.currentTarget.style.borderColor = "transparent" }}
        >
          <Settings size={14} strokeWidth={1.5} />
          {t.settings?.title ?? "Настройки"}
        </button>
        {open && panel}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Settings"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32,
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 4,
          color: "#A0A0A0",
          cursor: "pointer",
          transition: "border-color 150ms, color 150ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#e8002b"; e.currentTarget.style.color = "#FFFFFF" }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#A0A0A0" }}
      >
        <Settings size={15} strokeWidth={1.5} />
      </button>
      {open && panel}
    </>
  )
}
