"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, LogOut, Wallet, Clock, Star, RefreshCw } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"
import { LangSwitcher } from "@/components/LangSwitcher"
import { AppFooter } from "@/components/AppFooter"

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface RideRecord {
  id: string
  date: string
  transport: string
  machineId: string
  duration: string
  cost: number
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  borderRadius: 4,
}

/* ─── Skeleton shimmer block ─────────────────────────────────────────────── */
function Skeleton({ w = "100%", h = 16 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h,
      background: "linear-gradient(90deg, #1A1A1A 25%, #242424 50%, #1A1A1A 75%)",
      backgroundSize: "400px 100%",
      borderRadius: 3,
      animation: "shimmer 1.4s ease-in-out infinite",
    }} />
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { t } = useI18n()
  const router = useRouter()

  /* ── Mount guard (prevents SSR Supabase call) ── */
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => { setIsMounted(true) }, [])

  /* ── User identity ── */
  const [userId,      setUserId]      = useState<string | null>(null)
  const [email,       setEmail]       = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("...")
  const [loadingUser, setLoadingUser] = useState(true)

  /* ── Wallet ── */
  const [balance,      setBalance]      = useState<number | null>(null)
  const [loadingWallet, setLoadingWallet] = useState(true)

  /* ── Trips ── */
  const [rides,        setRides]        = useState<RideRecord[]>([])
  const [loadingRides, setLoadingRides] = useState(true)

  /* ── UI ── */
  const [loggingOut, setLoggingOut] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  /* ── Supabase client (browser-only) ── */
  const supabase = isMounted ? createSupabaseBrowserClient() : null

  /* ── Fetch user identity ── */
  const fetchUser = useCallback(async () => {
    if (!supabase) return
    setLoadingUser(true)

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      setDisplayName("GUEST")
      setLoadingUser(false)
      return
    }

    setUserId(user.id)
    setEmail(user.email ?? null)

    const fullName: string | undefined = user.user_metadata?.full_name
    const emailAddr = user.email ?? null

    if (fullName) {
      setDisplayName(fullName.toUpperCase())
    } else if (emailAddr) {
      setDisplayName(emailAddr.split("@")[0].toUpperCase())
    } else {
      setDisplayName("OPERATOR")
    }

    setLoadingUser(false)
  }, [supabase])

  /* ── Fetch wallet balance ── */
  const fetchWallet = useCallback(async (uid: string) => {
    if (!supabase) return
    setLoadingWallet(true)

    const { data, error } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", uid)
      .maybeSingle()

    if (!error && data) {
      setBalance(Number(data.balance ?? 0))
    } else {
      // Table doesn't exist or no row — show 0
      setBalance(0)
    }

    setLoadingWallet(false)
  }, [supabase])

  /* ── Fetch trip history ── */
  const fetchTrips = useCallback(async (uid: string) => {
    if (!supabase) return
    setLoadingRides(true)

    const { data, error } = await supabase
      .from("user_trips")
      .select("id, created_at, transport_name, machine_id, duration_minutes, cost")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20)

    if (!error && data) {
      const mapped: RideRecord[] = data.map(row => ({
        id:        String(row.id),
        date:      new Date(row.created_at).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
        }),
        transport: row.transport_name ?? "—",
        machineId: row.machine_id ?? "—",
        duration:  row.duration_minutes != null
          ? `${row.duration_minutes} min`
          : "—",
        cost: Number(row.cost ?? 0),
      }))
      setRides(mapped)
    } else {
      // Table doesn't exist or no rows — show empty state
      setRides([])
    }

    setLoadingRides(false)
  }, [supabase])

  /* ── Orchestrate all fetches on mount ── */
  useEffect(() => {
    if (!supabase) return

    fetchUser().then(() => {
      // userId is set inside fetchUser; we need it for subsequent calls.
      // Re-read from auth directly to avoid stale closure.
      supabase.auth.getUser().then(({ data }) => {
        const uid = data.user?.id
        if (!uid) return
        fetchWallet(uid)
        fetchTrips(uid)
      })
    })
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Manual refresh ── */
  const handleRefresh = async () => {
    if (!supabase || refreshing) return
    setRefreshing(true)
    const { data } = await supabase.auth.getUser()
    const uid = data.user?.id
    if (uid) {
      await Promise.all([fetchWallet(uid), fetchTrips(uid)])
    }
    setRefreshing(false)
  }

  /* ── Logout ── */
  const handleLogout = async () => {
    if (!supabase) return
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push("/auth")
  }

  /* ── Derived stats ── */
  const totalSpent  = rides.reduce((s, r) => s + r.cost, 0)
  const tripCount   = rides.length
  const isLoading   = loadingUser || loadingWallet || loadingRides

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid > div:nth-child(2) { border-right: none !important; }
          .stats-grid > div:nth-child(3) { border-top: 1px solid rgba(255,255,255,0.05); grid-column: 1 / -1; }
          .history-grid { grid-template-columns: 1fr 1fr 1fr !important; }
          .history-grid .col-machine { display: none; }
          .history-grid .col-vehicle { display: none; }
        }
      `}</style>

      <div data-testid="profile-page" style={{ minHeight: "100vh", background: "#040507", color: "#FFFFFF", overflowX: "hidden", position: "relative" }}>
        {/* Video background — TODO: Serik, change to your real video filename here */}
        <video
          autoPlay muted loop playsInline
          style={{
            position: "fixed", top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "cover", opacity: 0.12,
            zIndex: 0, pointerEvents: "none",
          }}
        >
          <source src="/city-night.mp4" type="video/mp4" />
        </video>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 0 64px", position: "relative", zIndex: 1 }}>

          {/* Top nav */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 20px 0",
          }}>
            <Link href="/map" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px",
              background: "rgba(15,17,21,0.75)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 4,
              color: "#FFFFFF", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none",
              transition: "border-color 150ms",
            }}>
              <ArrowLeft size={13} strokeWidth={1.5} />
              {t.nav.map}
            </Link>

            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#e8002b", textTransform: "uppercase" }}>
              {t.profile.wordmark}
            </p>

            <LangSwitcher />
          </div>

          {/* Page title */}
          <div style={{ padding: "32px 20px 0" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#A0A0A0", textTransform: "uppercase", marginBottom: 8 }}>
              {t.profile.section_label}
            </p>

            {loadingUser ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton w={200} h={28} />
                <Skeleton w={160} h={14} />
              </div>
            ) : (
              <>
                <h1 className="heading-auto" style={{ fontSize: "clamp(1.2rem, 4vw, 1.8rem)", fontWeight: 700, letterSpacing: "0.06em" }}>
                  {displayName}
                </h1>
                {email && (
                  <p style={{ fontSize: 13, color: "#A0A0A0", marginTop: 6 }}>{email}</p>
                )}
              </>
            )}
          </div>

          {/* Stats row */}
          <div style={{ padding: "24px 20px 0" }}>
            <div className="stats-grid glass-panel" style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
              {[
                {
                  label: t.profile.stat_rides,
                  value: loadingRides ? null : tripCount,
                  icon: <Clock size={13} strokeWidth={1.5} color="#A0A0A0" />,
                },
                {
                  label: t.profile.stat_spent,
                  value: loadingRides ? null : `${totalSpent.toLocaleString("ru-RU")} ₸`,
                  icon: <Wallet size={13} strokeWidth={1.5} color="#A0A0A0" />,
                },
                {
                  label: t.profile.stat_rating,
                  value: "—",
                  icon: <Star size={13} strokeWidth={1.5} color="#A0A0A0" />,
                },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: "20px 16px", textAlign: "center",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
                  {s.value === null ? (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Skeleton w={60} h={20} />
                    </div>
                  ) : (
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{s.value}</p>
                  )}
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#A0A0A0", textTransform: "uppercase", marginTop: 4 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Credits / Wallet card */}
          <div style={{ padding: "20px 20px 0" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#A0A0A0", textTransform: "uppercase", marginBottom: 8 }}>
              {t.profile.wallet_section}
            </p>
            <div className="glass-panel" style={{
              border: "1px solid #e8002b",
              borderRadius: 4,
              padding: "24px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#e8002b", textTransform: "uppercase", marginBottom: 10 }}>
                  {t.profile.credits_title}
                </p>
                {loadingWallet ? (
                  <Skeleton w={140} h={32} />
                ) : (
                  <p style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
                    {(balance ?? 0).toLocaleString("ru-RU")} &#8376;
                  </p>
                )}
              </div>
              <div style={{
                width: 44, height: 44,
                border: "1px solid #e8002b",
                borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(232,0,43,0.08)",
              }}>
                <Wallet size={20} strokeWidth={1.5} color="#e8002b" />
              </div>
            </div>
          </div>

          {/* Ride history */}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#A0A0A0", textTransform: "uppercase" }}>
                {t.profile.history_section}
              </p>
              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 10px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 4,
                  color: "#A0A0A0", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  cursor: refreshing || isLoading ? "not-allowed" : "pointer",
                  opacity: refreshing || isLoading ? 0.5 : 1,
                  fontFamily: "inherit",
                  transition: "border-color 150ms",
                }}
                onMouseEnter={e => { if (!refreshing) e.currentTarget.style.borderColor = "#e8002b" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1A1A" }}
              >
                <RefreshCw size={11} strokeWidth={1.5} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
                Refresh
              </button>
            </div>

            <div className="glass-panel" style={{ ...cardStyle, overflowX: "auto" }}>
              {/* Table header */}
              <div className="history-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr",
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                minWidth: 360,
              }}>
                {[
                  { label: t.profile.col_date,     cls: "" },
                  { label: t.profile.col_vehicle,  cls: "col-vehicle" },
                  { label: t.profile.col_duration, cls: "" },
                  { label: t.profile.col_machine,  cls: "col-machine" },
                  { label: t.profile.col_cost,     cls: "" },
                ].map(({ label, cls }) => (
                  <p key={label} className={cls} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#A0A0A0", textTransform: "uppercase" }}>
                    {label}
                  </p>
                ))}
              </div>

              {/* Loading skeleton rows */}
              {loadingRides && (
                <div style={{ padding: "16px" }}>
                  {[1, 2, 3].map(n => (
                    <div key={n} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <Skeleton w="18%" h={12} />
                      <Skeleton w="28%" h={12} />
                      <Skeleton w="18%" h={12} />
                      <Skeleton w="18%" h={12} />
                      <Skeleton w="18%" h={12} />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loadingRides && rides.length === 0 && (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 24, marginBottom: 12 }}>&#128694;</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>
                    {t.profile.history_empty}
                  </p>
                  <p style={{ fontSize: 12, color: "#A0A0A0" }}>
                    Your completed rides will appear here.
                  </p>
                </div>
              )}

              {/* Data rows */}
              {!loadingRides && rides.map((ride, i) => (
                <div
                  key={ride.id}
                  className="history-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr",
                    padding: "12px 16px",
                    borderBottom: i < rides.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "center",
                    minWidth: 360,
                  }}
                >
                  <p style={{ fontSize: 12, color: "#FFFFFF" }}>{ride.date}</p>
                  <p className="col-vehicle" style={{ fontSize: 12, color: "#A0A0A0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8 }}>
                    {ride.transport}
                  </p>
                  <p style={{ fontSize: 12, color: "#A0A0A0" }}>{ride.duration}</p>
                  <p className="col-machine" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#e8002b" }}>
                    {ride.machineId}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF" }}>
                    {ride.cost.toLocaleString("ru-RU")} &#8376;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Account section */}
          <div style={{ padding: "20px 20px 0" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#A0A0A0", textTransform: "uppercase", marginBottom: 8 }}>
              {t.profile.account_section}
            </p>
            <div className="glass-panel" style={cardStyle}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#A0A0A0", letterSpacing: "0.04em" }}>{t.profile.account_version}</span>
                <span style={{ fontSize: 12, color: "#FFFFFF" }}>1.0.0</span>
              </div>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#A0A0A0", letterSpacing: "0.04em" }}>{t.profile.account_platform}</span>
                <span style={{ fontSize: 12, color: "#FFFFFF" }}>Almaty Micromobility</span>
              </div>
              {/* User ID — useful for debugging / support */}
              {userId && (
                <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "#A0A0A0", letterSpacing: "0.04em", flexShrink: 0 }}>Operator ID</span>
                  <span style={{ fontSize: 10, color: "#8895a5", fontVariantNumeric: "tabular-nums", textAlign: "right", wordBreak: "break-all" }}>
                    {userId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <div style={{ padding: "20px 20px 0" }}>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                width: "100%", padding: "13px 20px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 4,
                color: "#e8002b",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: loggingOut ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loggingOut ? 0.5 : 1,
                transition: "border-color 150ms",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.borderColor = "#e8002b" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1A1A" }}
            >
              {loggingOut
                ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: "#e8002b" }} />
                : <LogOut size={14} strokeWidth={1.5} />
              }
              {loggingOut ? t.profile.signing_out : t.profile.btn_signout}
            </button>
          </div>

          {/* Footer */}
          <div style={{ padding: "40px 20px 0" }}>
            <AppFooter />
          </div>

        </div>
      </div>
    </>
  )
}
