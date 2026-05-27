"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Wallet, Clock, Star, RefreshCw,
  CreditCard, Plus, Trash2, LogOut, Settings,
  Sun, Moon, Lock, X, Eye, EyeOff, ChevronDown,
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"
import { LangSwitcher } from "@/components/LangSwitcher"
import { AppFooter } from "@/components/AppFooter"

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface RideRecord {
  id: string; date: string; transport: string
  machineId: string; duration: string; cost: number
}
interface PaymentMethod {
  id: string; type: "card" | "kaspi" | "cash"
  label: string; last4?: string; is_default: boolean
}
type AppTheme = "dark" | "light"

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function Skeleton({ w = "100%", h = 16 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h,
      background: "linear-gradient(90deg,#1c1f26 25%,#262a35 50%,#1c1f26 75%)",
      backgroundSize: "400px 100%", borderRadius: 6,
      animation: "shimmer 1.4s ease-in-out infinite",
    }} />
  )
}

/* ─── Avatar ────────────────────────────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
  return (
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: "linear-gradient(135deg,#e8002b 0%,#ff6b35 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px",
      flexShrink: 0,
      boxShadow: "0 0 0 3px rgba(232,0,43,0.2),0 8px 24px rgba(232,0,43,0.3)",
    }}>
      {initials || "?"}
    </div>
  )
}

/* ─── StatCard ──────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, loading, accent = false }: {
  icon: React.ReactNode; label: string; value: React.ReactNode
  loading?: boolean; accent?: boolean
}) {
  return (
    <div style={{
      background: accent
        ? "linear-gradient(135deg,rgba(232,0,43,0.12) 0%,rgba(232,0,43,0.04) 100%)"
        : "rgba(255,255,255,0.03)",
      border: `1px solid ${accent ? "rgba(232,0,43,0.3)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 16, padding: "20px 16px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ color: accent ? "#e8002b" : "#606878" }}>{icon}</div>
      {loading ? <Skeleton w={70} h={24} /> : (
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>{value}</div>
      )}
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#606878" }}>
        {label}
      </div>
    </div>
  )
}

/* ─── GhostBtn ──────────────────────────────────────────────────────────── */
function GhostBtn({ children, onClick, disabled, danger }: {
  children: React.ReactNode; onClick?: () => void
  disabled?: boolean; danger?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "6px 12px", background: "transparent",
      border: `1px solid ${danger ? "rgba(232,0,43,0.3)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 8,
      color: danger ? "#e8002b" : "#808898",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1, fontFamily: "inherit",
      transition: "border-color 150ms,color 150ms",
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = danger ? "#e8002b" : "#e8002b"; e.currentTarget.style.color = "#e8002b" } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = danger ? "rgba(232,0,43,0.3)" : "rgba(255,255,255,0.07)"; e.currentTarget.style.color = danger ? "#e8002b" : "#808898" }}
    >
      {children}
    </button>
  )
}

/* ─── PasswordInput ─────────────────────────────────────────────────────── */
function PasswordInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••"}
        style={{
          width: "100%", padding: "10px 40px 10px 12px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, color: "#e8eaf0", fontSize: 14,
          outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          transition: "border-color 150ms",
        }}
        onFocus={e => e.currentTarget.style.borderColor = "#e8002b"}
        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
      />
      <button onClick={() => setShow(v => !v)} type="button" style={{
        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer", color: "#606878", padding: 2,
      }}>
        {show ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS DRAWER (right-side slide-in)
═══════════════════════════════════════════════════════════════════════════ */
function SettingsDrawer({ open, onClose, email }: {
  open: boolean; onClose: () => void; email: string | null
}) {
  const { t } = useI18n()
  const [theme,       setThemeState] = useState<AppTheme>("dark")
  const [pwdOpen,     setPwdOpen]    = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [updatingPass, setUpdatingPass] = useState(false)
  const [passMessage,  setPassMessage]  = useState<{ text: string; ok: boolean } | null>(null)

  /* Restore theme from localStorage on mount */
  useEffect(() => {
    const saved = localStorage.getItem("app-theme") as AppTheme | null
    if (saved) { setThemeState(saved); applyTheme(saved) }
  }, [])

  function applyTheme(t: AppTheme) {
    if (t === "light") {
      document.documentElement.setAttribute("data-theme", "light")
      document.body.style.background = "#f4f4f5"
      document.body.style.color = "#09090b"
    } else {
      document.documentElement.setAttribute("data-theme", "dark")
      document.body.style.background = "#070a0f"
      document.body.style.color = "#e8eaf0"
    }
    localStorage.setItem("app-theme", t)
  }

  function handleTheme(t: AppTheme) {
    setThemeState(t)
    applyTheme(t)
  }

  async function handleUpdatePassword() {
    if (!email || !oldPassword || newPassword.length < 6) return
    setUpdatingPass(true)
    setPassMessage(null)
    const supabase = createSupabaseBrowserClient()
    // Step 1: verify old password
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: oldPassword })
    if (signInErr) {
      setPassMessage({ text: "Ескі пароль қате / Неверный старый пароль", ok: false })
      setUpdatingPass(false)
      return
    }
    // Step 2: update to new password
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
    if (updateErr) {
      setPassMessage({ text: updateErr.message, ok: false })
    } else {
      setPassMessage({ text: "Пароль сәтті өзгертілді ✓", ok: true })
      setOldPassword(""); setNewPassword(""); setPwdOpen(false)
    }
    setUpdatingPass(false)
  }

  const drawerBg  = "#0d1017"
  const borderClr = "rgba(255,255,255,0.07)"
  const lbl: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
    textTransform: "uppercase", color: "#505868", marginBottom: 10,
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }} />
      )}

      {/* Drawer panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "100%", maxWidth: 400,
        background: drawerBg,
        borderLeft: `1px solid ${borderClr}`,
        boxShadow: "-16px 0 48px rgba(0,0,0,0.6)",
        zIndex: 1001,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: `1px solid ${borderClr}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Settings size={16} strokeWidth={1.5} color="#e8002b" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>
              {(t as any).settings?.title ?? "Баптаулар"}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#606878", padding: 4 }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ flex: 1, padding: "20px" }}>

          {/* ── Language ── */}
          <p style={lbl}>{(t as any).settings?.lang ?? "Тіл / Язык"}</p>
          <div style={{ marginBottom: 24 }}>
            <LangSwitcher />
          </div>

          {/* ── Theme ── */}
          <p style={lbl}>{(t as any).settings?.theme ?? "Интерфейс тақырыбы"}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {([
              { id: "dark"  as AppTheme, icon: <Moon size={16} strokeWidth={1.5} />, label: (t as any).settings?.theme_dark  ?? "Cyberpunk Dark" },
              { id: "light" as AppTheme, icon: <Sun  size={16} strokeWidth={1.5} />, label: (t as any).settings?.theme_light ?? "Жарық режим" },
            ]).map(opt => {
              const active = theme === opt.id
              return (
                <button key={opt.id} onClick={() => handleTheme(opt.id)} style={{
                  flex: 1, padding: "12px 8px",
                  background: active ? "rgba(232,0,43,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "#e8002b" : borderClr}`,
                  borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  color: active ? "#e8002b" : "#606878",
                  transition: "border-color 150ms, background 150ms",
                }}>
                  {opt.icon}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── Password change ── */}
          <div style={{ borderTop: `1px solid ${borderClr}`, paddingTop: 20 }}>
            <button onClick={() => setPwdOpen(v => !v)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "none", border: "none", cursor: "pointer", padding: "0 0 12px",
              color: "#c0c8d8", fontFamily: "inherit",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={15} strokeWidth={1.5} color="#e8002b" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {(t as any).settings?.change_pwd ?? "Парольді өзгерту"}
                </span>
              </div>
              <ChevronDown size={14} strokeWidth={1.5} style={{ transform: pwdOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }} />
            </button>

            {pwdOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16 }}>
                <PasswordInput value={oldPassword} onChange={setOldPassword} placeholder="Ескі пароль / Старый пароль" />
                <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="Жаңа пароль (мин. 6 символ)" />
                {passMessage && (
                  <p style={{ fontSize: 12, color: passMessage.ok ? "#22c55e" : "#e8002b", fontWeight: 600 }}>
                    {passMessage.text}
                  </p>
                )}
                <button
                  onClick={handleUpdatePassword}
                  disabled={updatingPass || !oldPassword || newPassword.length < 6}
                  style={{
                    padding: "11px", background: updatingPass ? "#1a0000" : "#e8002b",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    cursor: updatingPass || !oldPassword || newPassword.length < 6 ? "not-allowed" : "pointer",
                    opacity: updatingPass || !oldPassword || newPassword.length < 6 ? 0.6 : 1,
                    fontFamily: "inherit", transition: "opacity 150ms",
                  }}
                >
                  {updatingPass ? "Жаңартылуда..." : "Парольді жаңарту"}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { t } = useI18n()
  const router = useRouter()

  const [isMounted,       setIsMounted]       = useState(false)
  const [userId,          setUserId]          = useState<string | null>(null)
  const [email,           setEmail]           = useState<string | null>(null)
  const [displayName,     setDisplayName]     = useState<string>("...")
  const [loadingUser,     setLoadingUser]     = useState(true)
  const [balance,         setBalance]         = useState<number | null>(null)
  const [loadingWallet,   setLoadingWallet]   = useState(true)
  const [rides,           setRides]           = useState<RideRecord[]>([])
  const [loadingRides,    setLoadingRides]    = useState(true)
  const [loggingOut,      setLoggingOut]      = useState(false)
  const [refreshing,      setRefreshing]      = useState(false)
  const [paymentMethods,  setPaymentMethods]  = useState<PaymentMethod[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [addingCard,      setAddingCard]      = useState(false)
  const [newCardNumber,   setNewCardNumber]   = useState("")
  const [savingCard,      setSavingCard]      = useState(false)
  const [activeTab,       setActiveTab]       = useState<"trips" | "payments">("trips")
  const [isDrawerOpen,    setIsDrawerOpen]    = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  /* Restore theme on mount */
  useEffect(() => {
    const saved = localStorage.getItem("app-theme") as AppTheme | null
    if (saved === "light") {
      document.documentElement.setAttribute("data-theme", "light")
      document.body.style.background = "#f4f4f5"
      document.body.style.color = "#09090b"
    }
  }, [])

  const supabase = isMounted ? createSupabaseBrowserClient() : null

  /* ── Fetchers ── */
  const fetchUser = useCallback(async () => {
    if (!supabase) return
    setLoadingUser(true)
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) { setDisplayName("GUEST"); setLoadingUser(false); return }
    setUserId(user.id)
    setEmail(user.email ?? null)
    const fullName: string | undefined = user.user_metadata?.full_name
    if (fullName) setDisplayName(fullName)
    else if (user.email) setDisplayName(user.email.split("@")[0])
    else setDisplayName("OPERATOR")
    setLoadingUser(false)
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWallet = useCallback(async (uid: string) => {
    if (!supabase) return
    setLoadingWallet(true)
    const { data, error } = await supabase
      .from("user_wallets").select("balance").eq("user_id", uid).maybeSingle()
    setBalance(!error && data ? Number(data.balance ?? 0) : 0)
    setLoadingWallet(false)
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTrips = useCallback(async (uid: string) => {
    if (!supabase) return
    setLoadingRides(true)
    const { data, error } = await supabase
      .from("user_trips")
      .select("id,created_at,transport_name,machine_id,duration_minutes,cost")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20)
    if (!error && data && data.length > 0) {
      setRides(data.map(row => ({
        id:        String(row.id),
        date:      new Date(row.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
        transport: row.transport_name ?? "—",
        machineId: row.machine_id ?? "—",
        duration:  row.duration_minutes != null ? `${row.duration_minutes} мин` : "—",
        cost:      Number(row.cost ?? 0),
      })))
    } else {
      /* Fallback mock — для демонстрации диплома */
      setRides([{
        id: "demo-1",
        date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
        transport: "Электросамокат S-4402",
        machineId: "S-4402",
        duration: "1 мин",
        cost: 250,
      }])
    }
    setLoadingRides(false)
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPayments = useCallback(async (uid: string) => {
    if (!supabase) return
    setLoadingPayments(true)
    const { data, error } = await supabase
      .from("payment_methods")
      .select("id,type,label,last4,is_default")
      .eq("user_id", uid)
      .order("is_default", { ascending: false })
    if (!error && data) {
      setPaymentMethods(data as PaymentMethod[])
    } else {
      setPaymentMethods([{ id: "mock-1", type: "kaspi", label: "Kaspi Gold", last4: "4242", is_default: true }])
    }
    setLoadingPayments(false)
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Orchestrate ── */
  useEffect(() => {
    if (!supabase) return
    fetchUser().then(() => {
      supabase.auth.getUser().then(({ data }) => {
        const uid = data.user?.id
        if (!uid) return
        fetchWallet(uid); fetchTrips(uid); fetchPayments(uid)
      })
    })
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Actions ── */
  const handleRefresh = async () => {
    if (!supabase || refreshing) return
    setRefreshing(true)
    const { data } = await supabase.auth.getUser()
    const uid = data.user?.id
    if (uid) await Promise.all([fetchWallet(uid), fetchTrips(uid)])
    setRefreshing(false)
  }

  const handleLogout = async () => {
    if (!supabase) return
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const handleAddCard = async () => {
    if (!supabase || !userId || newCardNumber.length < 4) return
    setSavingCard(true)
    const last4 = newCardNumber.replace(/\s/g, "").slice(-4)
    const { data, error } = await supabase
      .from("payment_methods")
      .insert({ user_id: userId, type: "card", label: "Bank Card", last4, is_default: paymentMethods.length === 0 })
      .select().single()
    if (!error && data) setPaymentMethods(prev => [...prev, data as PaymentMethod])
    setNewCardNumber(""); setAddingCard(false); setSavingCard(false)
  }

  const handleRemovePayment = async (id: string) => {
    if (!supabase) return
    await supabase.from("payment_methods").delete().eq("id", id)
    setPaymentMethods(prev => prev.filter(p => p.id !== id))
  }

  const handleSetDefault = async (id: string) => {
    if (!supabase || !userId) return
    await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", userId)
    await supabase.from("payment_methods").update({ is_default: true }).eq("id", id)
    setPaymentMethods(prev => prev.map(p => ({ ...p, is_default: p.id === id })))
  }

  const totalSpent = rides.filter(r => r.id !== "demo-1").reduce((s, r) => s + r.cost, 0)
  const isLoading  = loadingUser || loadingWallet || loadingRides

  /* ═══ RENDER ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .profile-root { font-family:'DM Sans',system-ui,sans-serif; min-height:100vh; background:#070a0f; color:#e8eaf0; overflow-x:hidden; position:relative; }
        .profile-inner { position:relative; z-index:1; max-width:660px; margin:0 auto; padding:0 20px 80px; animation:fadeSlideUp .5s ease both; }
        .profile-nav { display:flex; align-items:center; justify-content:space-between; padding:20px 0; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:32px; }
        .profile-hero { display:flex; align-items:center; gap:18px; margin-bottom:28px; }
        .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:28px; }
        @media(max-width:480px){ .stats-grid{grid-template-columns:1fr 1fr} }
        .tab-bar { display:flex; gap:4px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:4px; margin-bottom:14px; }
        .tab-btn { flex:1; padding:8px 0; border:none; border-radius:9px; font-family:inherit; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:background 200ms,color 200ms; }
        .tab-btn.active { background:rgba(232,0,43,0.15); color:#e8002b; box-shadow:inset 0 0 0 1px rgba(232,0,43,0.3); }
        .tab-btn.inactive { background:transparent; color:#505868; }
        .tab-btn.inactive:hover { color:#a0a8b8; }
        .trip-row { display:grid; grid-template-columns:1fr 1.5fr 1fr 1fr; padding:13px 16px; align-items:center; gap:4px; transition:background 150ms; }
        .trip-row:hover { background:rgba(255,255,255,0.02); }
        @media(max-width:480px){ .trip-row{grid-template-columns:1fr 1fr 1fr} .trip-col-machine{display:none!important} }
        .pm-row { display:flex; align-items:center; gap:12px; padding:14px 16px; transition:background 150ms; }
        .pm-row:hover { background:rgba(255,255,255,0.02); }
        .logout-btn { width:100%; padding:14px 20px; background:transparent; border:1px solid rgba(232,0,43,0.2); border-radius:12px; color:#e8002b; font-family:inherit; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background 200ms,border-color 200ms; }
        .logout-btn:hover:not(:disabled) { background:rgba(232,0,43,0.08); border-color:#e8002b; }
        .logout-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .nav-back { display:flex; align-items:center; gap:6px; padding:8px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:10px; color:#c0c8d8; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; text-decoration:none; transition:border-color 150ms; }
        .nav-back:hover { border-color:rgba(255,255,255,0.16); }
        .wallet-card { background:linear-gradient(135deg,rgba(232,0,43,0.12) 0%,rgba(12,14,22,0.8) 100%); border:1px solid rgba(232,0,43,0.25); border-radius:20px; padding:24px; display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; position:relative; overflow:hidden; }
        .divider { height:1px; background:rgba(255,255,255,0.05); margin:24px 0; }
        .col-label { font-size:9px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#404858; }
        .settings-trigger { display:flex; align-items:center; justify-content:center; width:36px; height:36px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:10px; cursor:pointer; color:#808898; transition:border-color 150ms,color 150ms; }
        .settings-trigger:hover { border-color:#e8002b; color:#e8002b; }
      `}</style>

      {/* Settings Drawer */}
      <SettingsDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} email={email} />

      <div className="profile-root">
        <video autoPlay muted loop playsInline style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.07,zIndex:0,pointerEvents:"none" }}>
          <source src="/city-night.mp4" type="video/mp4" />
        </video>

        <div className="profile-inner">

          {/* ── Nav ── */}
          <div className="profile-nav">
            <Link href="/map" className="nav-back">
              <ArrowLeft size={12} strokeWidth={2} />
              {t.nav.map}
            </Link>
            <span style={{ fontFamily:"inherit", fontSize:13, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:"#e8002b" }}>
              {t.profile.wordmark}
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <LangSwitcher />
              <button className="settings-trigger" onClick={() => setIsDrawerOpen(true)} title="Баптаулар / Настройки">
                <Settings size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* ── Hero ── */}
          <div className="profile-hero">
            {loadingUser
              ? <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,0.05)",animation:"pulse 1.4s ease-in-out infinite" }} />
              : <Avatar name={displayName} />
            }
            <div style={{ flex:1, minWidth:0 }}>
              {loadingUser ? (
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  <Skeleton w={180} h={26} /><Skeleton w={140} h={14} />
                </div>
              ) : (
                <>
                  <h1 style={{ fontFamily:"inherit",fontSize:"clamp(20px,5vw,28px)",fontWeight:800,letterSpacing:"-0.02em",color:"#fff",lineHeight:1.1,marginBottom:4 }}>
                    {displayName}
                  </h1>
                  {email && <p style={{ fontSize:13,color:"#606878",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{email}</p>}
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:8 }}>
                    <div style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e",animation:"pulse 2s ease-in-out infinite" }} />
                    <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#22c55e" }}>Активен</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="stats-grid">
            <StatCard icon={<Clock size={16} strokeWidth={1.5} />} label={t.profile.stat_rides} value={rides.filter(r=>r.id!=="demo-1").length || rides.length} loading={loadingRides} />
            <StatCard icon={<Wallet size={16} strokeWidth={1.5} />} label={t.profile.stat_spent} value={`${totalSpent.toLocaleString("ru-RU")} ₸`} loading={loadingRides} accent />
            <StatCard icon={<Star size={16} strokeWidth={1.5} />} label={t.profile.stat_rating} value="—" />
          </div>

          {/* ── Wallet ── */}
          <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.15em",color:"#505868",textTransform:"uppercase",marginBottom:10 }}>{t.profile.wallet_section}</p>
          <div className="wallet-card">
            <div>
              <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(232,0,43,0.7)",marginBottom:10 }}>{t.profile.credits_title}</p>
              {loadingWallet ? <Skeleton w={150} h={36} /> : (
                <p style={{ fontSize:36,fontWeight:800,letterSpacing:"-0.04em",color:"#fff" }}>
                  {(balance ?? 0).toLocaleString("ru-RU")} ₸
                </p>
              )}
            </div>
            <div style={{ width:48,height:48,background:"rgba(232,0,43,0.12)",border:"1px solid rgba(232,0,43,0.25)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Wallet size={22} strokeWidth={1.5} color="#e8002b" />
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="tab-bar">
            {(["trips","payments"] as const).map(tab => (
              <button key={tab} className={`tab-btn ${activeTab===tab?"active":"inactive"}`} onClick={() => setActiveTab(tab)}>
                {tab==="trips" ? t.profile.history_section : (t as any).profile?.payment_section ?? "Оплата"}
              </button>
            ))}
          </div>

          {/* ─── TAB: TRIPS ─── */}
          {activeTab === "trips" && (
            <div style={{ animation:"fadeSlideUp .25s ease both" }}>
              <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:10 }}>
                <GhostBtn onClick={handleRefresh} disabled={refreshing||isLoading}>
                  <RefreshCw size={11} strokeWidth={1.5} style={{ animation:refreshing?"spin 0.6s linear infinite":"none" }} />
                  Обновить
                </GhostBtn>
              </div>
              <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden" }}>
                <div className="trip-row" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)",paddingTop:10,paddingBottom:10 }}>
                  <span className="col-label">{t.profile.col_date}</span>
                  <span className="col-label">{t.profile.col_vehicle}</span>
                  <span className="col-label">{t.profile.col_duration}</span>
                  <span className="col-label">{t.profile.col_cost}</span>
                </div>
                {loadingRides && (
                  <div style={{ padding:16,display:"flex",flexDirection:"column",gap:12 }}>
                    {[1,2,3].map(n => (
                      <div key={n} style={{ display:"flex",gap:10 }}>
                        <Skeleton w="20%" h={12} /><Skeleton w="35%" h={12} /><Skeleton w="20%" h={12} /><Skeleton w="20%" h={12} />
                      </div>
                    ))}
                  </div>
                )}
                {!loadingRides && rides.length === 0 && (
                  <div style={{ padding:"48px 20px",textAlign:"center" }}>
                    <div style={{ fontSize:32,marginBottom:8 }}>🛴</div>
                    <p style={{ fontSize:14,fontWeight:600,color:"#c0c8d8" }}>{t.profile.history_empty}</p>
                  </div>
                )}
                {!loadingRides && rides.map((ride, i) => (
                  <div key={ride.id} className="trip-row" style={{ borderBottom:i<rides.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                    <span style={{ fontSize:12,color:"#808898" }}>{ride.date}</span>
                    <span style={{ fontSize:12,color:"#c0c8d8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8 }}>{ride.transport}</span>
                    <span style={{ fontSize:12,color:"#808898" }}>{ride.duration}</span>
                    <span style={{ fontSize:13,fontWeight:700,color:"#fff" }}>{ride.cost.toLocaleString("ru-RU")} ₸</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB: PAYMENTS ─── */}
          {activeTab === "payments" && (
            <div style={{ animation:"fadeSlideUp .25s ease both" }}>
              <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:10 }}>
                <GhostBtn onClick={() => setAddingCard(v => !v)}>
                  <Plus size={11} strokeWidth={2} />
                  {(t as any).profile?.payment_add ?? "Добавить"}
                </GhostBtn>
              </div>
              {addingCard && (
                <div style={{ background:"rgba(232,0,43,0.06)",border:"1px solid rgba(232,0,43,0.2)",borderRadius:14,padding:16,marginBottom:10 }}>
                  <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"#606878",marginBottom:10 }}>
                    {(t as any).profile?.payment_card_number ?? "Номер карты"}
                  </p>
                  <div style={{ display:"flex",gap:8 }}>
                    <input type="text" inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000"
                      value={newCardNumber} onChange={e => setNewCardNumber(e.target.value.replace(/[^\d\s]/g,""))}
                      style={{ flex:1,padding:"10px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:"#e8eaf0",fontSize:14,fontFamily:"monospace",letterSpacing:"0.1em",outline:"none" }}
                      onFocus={e => e.currentTarget.style.borderColor="#e8002b"}
                      onBlur={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}
                    />
                    <button onClick={handleAddCard} disabled={savingCard||newCardNumber.replace(/\s/g,"").length<4}
                      style={{ padding:"10px 18px",background:"#e8002b",border:"none",borderRadius:10,color:"#fff",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",opacity:savingCard?0.5:1 }}>
                      {savingCard ? "…" : (t as any).profile?.payment_save ?? "Сохранить"}
                    </button>
                  </div>
                </div>
              )}
              <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden" }}>
                {loadingPayments && <div style={{ padding:16 }}><Skeleton h={44} /></div>}
                {!loadingPayments && paymentMethods.length === 0 && (
                  <div style={{ padding:"48px 20px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
                    <CreditCard size={28} strokeWidth={1} color="#505868" />
                    <p style={{ fontSize:13,color:"#808898" }}>{(t as any).profile?.payment_empty ?? "Нет способов оплаты"}</p>
                  </div>
                )}
                {!loadingPayments && paymentMethods.map((pm, i) => {
                  const icons: Record<string,string> = { card:"💳", kaspi:"🟡", cash:"💵" }
                  return (
                    <div key={pm.id} className="pm-row" style={{ borderBottom:i<paymentMethods.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                      <span style={{ fontSize:22 }}>{icons[pm.type] ?? "💳"}</span>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:14,fontWeight:600,color:"#e8eaf0" }}>{pm.label}{pm.last4 ? ` ···· ${pm.last4}` : ""}</p>
                        {pm.is_default && (
                          <p style={{ fontSize:9,fontWeight:700,color:"#22c55e",letterSpacing:"0.12em",textTransform:"uppercase",marginTop:2 }}>
                            ✓ {(t as any).profile?.payment_default ?? "По умолчанию"}
                          </p>
                        )}
                      </div>
                      {!pm.is_default && (
                        <GhostBtn onClick={() => handleSetDefault(pm.id)}>
                          {(t as any).profile?.payment_set_default ?? "Сделать основным"}
                        </GhostBtn>
                      )}
                      <button onClick={() => handleRemovePayment(pm.id)}
                        style={{ background:"none",border:"none",cursor:"pointer",color:"#505868",padding:4,transition:"color 150ms" }}
                        onMouseEnter={e => e.currentTarget.style.color="#e8002b"}
                        onMouseLeave={e => e.currentTarget.style.color="#505868"}>
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Account info ── */}
          <div className="divider" />
          <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.15em",color:"#505868",textTransform:"uppercase",marginBottom:10 }}>{t.profile.account_section}</p>
          <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden",marginBottom:20 }}>
            {[
              { label: t.profile.account_version,  value: "1.0.0" },
              { label: t.profile.account_platform, value: "Almaty Micromobility" },
              ...(userId ? [{ label: "Operator ID", value: userId }] : []),
            ].map((row, i, arr) => (
              <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",gap:16,borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                <span style={{ fontSize:12,color:"#606878",flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:row.label==="Operator ID"?10:13,color:"#c0c8d8",textAlign:"right",wordBreak:"break-all",fontVariantNumeric:"tabular-nums" }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Logout ── */}
          <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut
              ? <div style={{ width:14,height:14,border:"2px solid rgba(232,0,43,0.3)",borderTopColor:"#e8002b",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />
              : <LogOut size={14} strokeWidth={1.5} />
            }
            {loggingOut ? t.profile.signing_out : t.profile.btn_signout}
          </button>

          {/* ── Footer ── */}
          <div style={{ marginTop:40 }}>
            <AppFooter />
          </div>

        </div>
      </div>
    </>
  )
}
