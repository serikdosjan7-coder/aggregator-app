"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, User, TriangleAlert as AlertTriangle, Battery,
  Navigation, Clock, Star, ChevronRight, MapPin, List, X,
  Zap, Bike, Gauge,
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"
import { VehicleIllustration } from "@/components/VehicleIllustration"

type TransportType = "scooter" | "ebike" | "bike" | "moped"

interface ScooterMarker {
  id: string; lat: number; lng: number; name: string; type: TransportType
  battery: number; pricePerHour: number; pricePerDay: number; distance: number
  provider: string; isVerified: boolean; rating: number; totalRides: number
  features: string[]; status: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMarker(row: Record<string, any>): ScooterMarker | null {
  const lat = parseFloat(row.latitude ?? row.lat ?? row.y ?? "")
  const lng = parseFloat(row.longitude ?? row.lng ?? row.x ?? "")
  if (!isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  const rawType = (row.vehicle_type ?? row.type ?? "scooter") as string
  const type: TransportType =
    rawType === "electric_scooter" || rawType === "scooter" ? "scooter"
    : rawType === "electric_bike" || rawType === "ebike" ? "ebike"
    : rawType === "bicycle" || rawType === "bike" ? "bike"
    : rawType === "moped" ? "moped" : "scooter"
  const battery = Number(row.battery_level ?? row.battery ?? row.charge ?? 100)
  const pricePerHour = Number(row.price_per_hour ?? row.pricePerHour ?? row.price ?? 0)
  let status = "available"
  if (row.status !== undefined) { status = String(row.status) }
  else if (row.is_available !== undefined) {
    status = (row.is_available === true || row.is_available === "true") ? "available" : "booked"
  }
  return {
    id: String(row.id ?? Math.random()), lat, lng,
    name: row.name ?? row.model ?? row.vehicle_name ?? "Vehicle",
    type, battery, pricePerHour,
    pricePerDay: Number(row.price_per_day ?? row.pricePerDay ?? 0),
    distance: Number(row.distance ?? 0),
    provider: row.provider ?? row.company ?? row.operator ?? "---",
    isVerified: Boolean(row.is_verified ?? row.isVerified ?? false),
    rating: Number(row.rating ?? 0),
    totalRides: Number(row.total_rides ?? row.totalRides ?? 0),
    features: Array.isArray(row.features) ? row.features : [],
    status,
  }
}

const MOCK: ScooterMarker[] = [
  { id: "1", lat: 43.2389, lng: 76.8897, name: "Xiaomi Pro 2", type: "scooter", battery: 82, pricePerHour: 800, pricePerDay: 5000, distance: 0.2, provider: "ScootAlmaty", isVerified: true, rating: 4.8, totalRides: 124, features: ["helmet", "lock"], status: "available" },
  { id: "2", lat: 43.2420, lng: 76.8950, name: "Segway E45", type: "ebike", battery: 61, pricePerHour: 600, pricePerDay: 3500, distance: 0.6, provider: "BikeCity", isVerified: true, rating: 4.6, totalRides: 87, features: ["lock", "basket"], status: "available" },
  { id: "3", lat: 43.2350, lng: 76.8840, name: "Trek FX 3", type: "bike", battery: 100, pricePerHour: 400, pricePerDay: 2500, distance: 1.1, provider: "ScootAlmaty", isVerified: true, rating: 4.9, totalRides: 203, features: ["helmet", "lock", "basket"], status: "available" },
  { id: "4", lat: 43.2460, lng: 76.9010, name: "Honda Dio 110", type: "moped", battery: 45, pricePerHour: 1200, pricePerDay: 7000, distance: 1.7, provider: "MotoRent", isVerified: false, rating: 4.4, totalRides: 45, features: ["helmet"], status: "booked" },
  { id: "5", lat: 43.2310, lng: 76.8960, name: "Ninebot Max G30", type: "scooter", battery: 33, pricePerHour: 900, pricePerDay: 5500, distance: 0.9, provider: "BikeCity", isVerified: true, rating: 4.7, totalRides: 156, features: ["lock"], status: "available" },
  { id: "6", lat: 43.2400, lng: 76.8820, name: "Cube Reaction", type: "ebike", battery: 78, pricePerHour: 1000, pricePerDay: 6000, distance: 0.4, provider: "ScootAlmaty", isVerified: true, rating: 4.9, totalRides: 67, features: ["helmet", "lock"], status: "available" },
  { id: "7", lat: 43.2480, lng: 76.8870, name: "Kugoo S3 Pro", type: "scooter", battery: 91, pricePerHour: 750, pricePerDay: 4500, distance: 1.3, provider: "RideKZ", isVerified: true, rating: 4.5, totalRides: 98, features: ["lock"], status: "available" },
  { id: "8", lat: 43.2330, lng: 76.9050, name: "Giant Escape 3", type: "bike", battery: 100, pricePerHour: 350, pricePerDay: 2000, distance: 2.1, provider: "BikeCity", isVerified: false, rating: 4.3, totalRides: 34, features: ["basket"], status: "available" },
]

/* ─── Type config (matches MapView) ──────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TYPE_META: Record<TransportType, { Icon: React.ComponentType<any>; bg: string; color: string }> = {
  scooter: { Icon: Zap,   bg: "rgba(232,0,43,0.12)",    color: "#e8002b" },
  ebike:   { Icon: Bike,  bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  bike:    { Icon: Bike,  bg: "rgba(255,255,255,0.08)", color: "#ffffff" },
  moped:   { Icon: Gauge, bg: "rgba(0,176,255,0.12)",   color: "#00b0ff" },
}

const TYPE_LABELS: Record<TransportType | "all", string> = {
  all:     "All",
  scooter: "Taycan Scooter",
  ebike:   "E-Tron Bike",
  bike:    "Bike",
  moped:   "Urban Moped",
}

/* ─── Skeleton loaders ──────────────────────────────────────────────────── */
function SidebarSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded animate-pulse" style={{ background: "#121212", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="rounded-full shrink-0" style={{ width: 36, height: 36, background: "#1A1A1A" }} />
          <div className="flex-1 space-y-2">
            <div className="rounded" style={{ height: 10, width: "60%", background: "#1A1A1A" }} />
            <div className="rounded" style={{ height: 8, width: "40%", background: "#1A1A1A" }} />
          </div>
          <div className="rounded" style={{ height: 14, width: 40, background: "#1A1A1A" }} />
        </div>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded p-3" style={{ background: "#121212", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-full shrink-0" style={{ width: 32, height: 32, background: "#1A1A1A" }} />
        <div className="flex-1 space-y-2">
          <div className="rounded" style={{ height: 10, width: "55%", background: "#1A1A1A" }} />
          <div className="rounded" style={{ height: 8, width: "35%", background: "#1A1A1A" }} />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="rounded" style={{ height: 8, width: 48, background: "#1A1A1A" }} />
        <div className="rounded" style={{ height: 8, width: 48, background: "#1A1A1A" }} />
        <div className="rounded" style={{ height: 8, width: 48, background: "#1A1A1A" }} />
      </div>
    </div>
  )
}

/* ─── Dynamic MapView ──────────────────────────────────────────────────── */
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#A0A0A0", textTransform: "uppercase" }}>INITIALISING MAP...</p>
      </div>
    </div>
  ),
})

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    function check() { setIsDesktop(window.innerWidth >= breakpoint) }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [breakpoint])
  return isDesktop
}

function showToastSetter(setter: (v: string | null) => void, msg: string) {
  setter(msg)
  setTimeout(() => setter(null), 4000)
}

function fmtCD(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
}

function fmtEL(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0")
  const sc = (s % 60).toString().padStart(2, "0")
  return h > 0 ? `${h}:${m}:${sc}` : `${m}:${sc}`
}

/* ─── Main page ────────────────────────────────────────────────────────── */
export default function MapPage() {
  const { t } = useI18n()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [transport, setTransport] = useState<ScooterMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"supabase" | "mock">("mock")
  const [selected, setSelected] = useState<ScooterMarker | null>(null)
  const [activeFilter, setActiveFilter] = useState<TransportType | "all">("all")
  const [smartFilter, setSmartFilter] = useState<"all" | "econom" | "maxcharge">("all")
  const [filterKey, setFilterKey] = useState(0)
  const [userInitial, setUserInitial] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeBooking, setActiveBooking] = useState<{ id: string; name: string; type: TransportType; pricePerHour: number } | null>(null)
  const [bookingTime, setBookingTime] = useState(0)
  const [activeRide, setActiveRide] = useState<{ id: string; name: string; type: TransportType; pricePerHour: number; startedAt: number } | null>(null)
  const [rideElapsed, setRideElapsed] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportType, setReportType] = useState("battery")
  const [reportVehicle, setReportVehicle] = useState("")
  const [reportMessage, setReportMessage] = useState("")
  const [reportSending, setReportSending] = useState(false)
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [guestBannerDismissed, setGuestBannerDismissed] = useState(false)
  const isDesktop = useIsDesktop()

  const supabase = typeof window !== "undefined" ? createSupabaseBrowserClient() : null
  const BOOKING_DURATION = 10 * 60

  /* Booking countdown */
  useEffect(() => {
    if (!activeBooking) return
    const iv = setInterval(() => {
      setBookingTime((p) => {
        if (p <= 1) { clearInterval(iv); setActiveBooking(null); setToast("Booking expired."); return 0 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [activeBooking])

  /* Ride timer */
  useEffect(() => {
    if (!activeRide) return
    const iv = setInterval(() => setRideElapsed(Math.floor((Date.now() - activeRide.startedAt) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [activeRide])

  function showToast(msg: string) { showToastSetter(setToast, msg) }

  function reserveVehicle(v: ScooterMarker) {
    if (activeBooking || activeRide) { showToast(t.map.booking_already); return }
    setActiveBooking({ id: v.id, name: v.name, type: v.type, pricePerHour: v.pricePerHour })
    setBookingTime(BOOKING_DURATION); setSelected(null)
    showToast(`${v.name} ${t.map.booking_confirmed}`)
  }

  function startRide(v: ScooterMarker) {
    if (activeRide) { showToast(t.map.booking_already); return }
    if (activeBooking?.id === v.id) { setActiveBooking(null); setBookingTime(0) }
    setActiveRide({ id: v.id, name: v.name, type: v.type, pricePerHour: v.pricePerHour, startedAt: Date.now() })
    setRideElapsed(0); setSelected(null)
    showToast(t.map.ride_started ?? "Ride started!")
  }

  function cancelBooking() { setActiveBooking(null); setBookingTime(0); showToast(t.map.booking_cancelled) }

  async function finishRide() {
    if (!activeRide || finishing) return
    setFinishing(true)
    const dMin = Math.max(1, Math.ceil(rideElapsed / 60))
    const cost = Math.round(dMin * (activeRide.pricePerHour / 60))
    if (supabase && userId) {
      const now = new Date().toISOString()
      const startTime = new Date(activeRide.startedAt).toISOString()

      // Пишем в user_trips (для профиля)
      await supabase.from("user_trips").insert({
        user_id: userId,
        vehicle_id: activeRide.id,
        transport_name: activeRide.name,
        machine_id: activeRide.id,
        duration_minutes: dMin,
        cost,
        created_at: now,
      })

      // Пишем в rides (основная таблица биллинга)
      await supabase.from("rides").insert({
        user_id: userId,
        vehicle_id: activeRide.id,
        start_time: startTime,
        end_time: now,
        duration_minutes: dMin,
        total_price: cost,
        status: "completed",
        created_at: now,
      })

      // Списываем с кошелька
      const { data: w } = await supabase.from("user_wallets").select("balance").eq("user_id", userId).maybeSingle()
      await supabase.from("user_wallets").upsert(
        { user_id: userId, balance: Math.max(0, Number(w?.balance ?? 0) - cost) },
        { onConflict: "user_id" }
      )

      // Обновляем баланс в profiles тоже (если есть колонка balance)
      await supabase.from("profiles")
        .update({ balance: Math.max(0, Number(w?.balance ?? 0) - cost) })
        .eq("id", userId)
    }
    setActiveRide(null); setRideElapsed(0); setFinishing(false)
    showToast(`${t.map.ride_finished ?? "Ride finished."} ${cost.toLocaleString("ru-RU")} \u20B8`)
  }

  async function submitReport() {
    if (!reportMessage.trim()) return
    setReportSending(true)
    if (supabase) await supabase.from("system_alerts").insert({ type: reportType, vehicle: reportVehicle || null, message: reportMessage.trim(), status: "open", created_at: new Date().toISOString() }).then(() => { })
    setReportOpen(false); setReportType("battery"); setReportVehicle(""); setReportMessage(""); setReportSending(false)
    showToast(t.map.report_success)
  }

  /* Handle sidebar item click — fly to marker and auto-select */
  const handleSidebarSelect = useCallback((m: ScooterMarker) => {
    setSelected(m)
    setMobileTab("map")
  }, [])

  /* Mount + auth */
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (typeof window === "undefined") return
    let a = true
    supabase?.auth.getUser().then(({ data }) => {
      if (!a) return
      const u = data.user; if (!u) return
      setUserId(u.id)
      const n = u.user_metadata?.full_name ?? u.email ?? ""
      setUserInitial(n[0]?.toUpperCase() ?? null)
      const r = u.user_metadata?.role ?? u.app_metadata?.role ?? ""
      setIsAdmin(r === "admin")
    })
    return () => { a = false }
  }, [])

  /* Fetch vehicles */
  useEffect(() => {
    if (typeof window === "undefined") return
    let a = true
    async function fetch() {
      setLoading(true)
      try {
        if (!supabase) { setTransport(MOCK); setSource("mock"); return }
        const { data: vd, error: ve } = await supabase.from("vehicles").select("*")
        if (!a) return
        if (!ve && vd && vd.length > 0) { const v = vd.map(rowToMarker).filter((m): m is ScooterMarker => m !== null); if (v.length > 0) { setTransport(v); setSource("supabase"); return } }
        const { data: td, error: te } = await supabase.from("transport").select("*")
        if (!a) return
        if (!te && td && td.length > 0) { const v = td.map(rowToMarker).filter((m): m is ScooterMarker => m !== null); if (v.length > 0) { setTransport(v); setSource("supabase"); return } }
        setTransport(MOCK); setSource("mock")
      } catch { if (a) { setTransport(MOCK); setSource("mock") } }
      finally { if (a) setLoading(false) }
    }
    fetch(); return () => { a = false }
  }, [])

  /* Filtered data */
  const filtered = transport
    .filter(m => activeFilter === "all" || m.type === activeFilter)
    .filter(m => smartFilter === "econom" ? m.pricePerHour < 700 : smartFilter === "maxcharge" ? m.battery > 80 : true)
    .filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const availableCount = transport.filter(m => m.status === "available").length

  function setTF(f: TransportType | "all") { setActiveFilter(f); setFilterKey(k => k + 1) }

  if (!mounted) return (
    <div style={{ height: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  )

  const isBooked = activeBooking?.id === selected?.id
  const bookedId = activeBooking?.id ?? activeRide?.id ?? null

  /* ─── Responsive sidebar ─────────────────────────────────────────────── */
  const sidebarWidth = sidebarOpen ? 340 : 0

  function renderSidebar() {
    return (
      <aside
        className="scrollbar-hide"
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          background: "rgba(15,17,21,0.75)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 200ms, min-width 200ms",
        }}
      >
        {/* Search inside sidebar */}
        <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <input
            type="text"
            placeholder={t.map.search_placeholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px", background: "#121212",
              border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#FFFFFF",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", outline: "none", fontFamily: "inherit",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#e8002b")}
            onBlur={e => (e.currentTarget.style.borderColor = "#1A1A1A")}
          />
        </div>

        {/* Filter pills */}
        <div style={{ padding: "8px 12px", display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {(["all", "scooter", "ebike", "bike", "moped"] as const).map(tp => (
            <button key={tp} onClick={() => setTF(tp)}
              style={{
                padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                border: "1px solid", borderColor: activeFilter === tp ? "#e8002b" : "#1A1A1A",
                background: activeFilter === tp ? "rgba(232,0,43,0.08)" : "#121212",
                color: activeFilter === tp ? "#FFFFFF" : "#A0A0A0",
                cursor: "pointer", transition: "border-color 150ms, color 150ms", whiteSpace: "nowrap" as const,
              }}
            >
              {TYPE_LABELS[tp]}
            </button>
          ))}
          <div style={{ width: 1, background: "#1A1A1A", margin: "0 2px", alignSelf: "stretch" }} />
          {(["all", "econom", "maxcharge"] as const).map(id => (
            <button key={id} onClick={() => { setSmartFilter(id); setFilterKey(k => k + 1) }}
              style={{
                padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                border: "1px solid", borderColor: smartFilter === id ? "#e8002b" : "#1A1A1A",
                background: smartFilter === id ? "rgba(232,0,43,0.08)" : "#121212",
                color: smartFilter === id ? "#FFFFFF" : "#A0A0A0",
                cursor: "pointer", transition: "border-color 150ms, color 150ms", whiteSpace: "nowrap" as const,
              }}
            >
              {id === "all" ? t.map.filter_all_prices : id === "econom" ? t.map.filter_econom : t.map.filter_charge}
            </button>
          ))}
        </div>

        {/* Vehicle list */}
        <div className="scrollbar-hide" style={{ flex: 1, overflowY: "auto" }}>
          {loading ? <SidebarSkeleton /> : (
            filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "#A0A0A0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>No vehicles found</p>
              </div>
            ) : (
              <div style={{ padding: "6px 8px" }}>
                {filtered.map(m => {
                  const meta = TYPE_META[m.type] ?? TYPE_META.scooter
                  const av = m.status === "available"
                  const bc = m.battery > 60 ? "#22C55E" : m.battery > 30 ? "#D97706" : "#e8002b"
                  const isActive = selected?.id === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSidebarSelect(m)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "10px 10px", marginBottom: 4, borderRadius: 4, cursor: "pointer",
                        background: isActive ? "rgba(232,0,43,0.08)" : "rgba(15,17,21,0.75)",
                        border: `1px solid ${isActive ? "#e8002b" : "#1A1A1A"}`,
                        transition: "border-color 150ms, background 150ms", textAlign: "left",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = "#333333" }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = "#1A1A1A" }}
                    >
                      {/* Type badge */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", background: meta.bg,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <meta.Icon size={16} color={meta.color} />
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                            {m.name}
                          </p>
                          {m.isVerified && <span style={{ fontSize: 7, fontWeight: 700, color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 2, padding: "0 4px", letterSpacing: "0.05em" }}>OK</span>}
                        </div>
                        <p style={{ fontSize: 10, color: "#A0A0A0", marginTop: 1 }}>{m.provider} · {m.distance.toFixed(1)} km</p>
                      </div>
                      {/* Quick stats */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: bc }}>{m.battery}%</p>
                        <p style={{ fontSize: 10, color: "#A0A0A0" }}>{Math.round(m.pricePerHour / 60)}₸/m</p>
                      </div>
                      <ChevronRight size={14} style={{ color: isActive ? "#e8002b" : "#333333", flexShrink: 0 }} />
                    </button>
                  )
                })}
              </div>
            )
          )}
        </div>

        {/* Sidebar footer stats */}
        <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8002b", display: "inline-block" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#FFFFFF" }}>{availableCount} {t.map.available}</span>
          {source === "supabase" && <span style={{ fontSize: 9, color: "#A0A0A0" }}>· {t.map.live}</span>}
        </div>
      </aside>
    )
  }

  /* ─── Render ────────────────────────────────────────────────────────── */
  return (
    <div suppressHydrationWarning data-testid="map-container" style={{ height: "100vh", background: "#040507", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`@keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(232,0,43,0.5),0 0 40px rgba(232,0,43,0.2)}50%{box-shadow:0 0 40px rgba(232,0,43,0.9),0 0 80px rgba(232,0,43,0.4)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      {/* ── Active ride bar ─────────────────────────────────────────── */}
      {activeRide && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 960, background: "#000000", borderTop: "2px solid #e8002b" }}>
          <div style={{ height: 2, background: "linear-gradient(90deg,#e8002b,transparent)" }} />
          <div style={{ padding: "16px 20px 20px", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e8002b", display: "inline-block", animation: "pulse-glow 1.5s ease-in-out infinite" }} />
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "#e8002b", textTransform: "uppercase", marginBottom: 2 }}>{t.map.ride_active ?? "ACTIVE RIDE"}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>{activeRide.name}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#A0A0A0", textTransform: "uppercase", marginBottom: 4 }}>{t.map.ride_duration ?? "Duration"}</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums", fontFamily: "'Courier New',monospace", lineHeight: 1 }}>{fmtEL(rideElapsed)}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#A0A0A0", textTransform: "uppercase", marginBottom: 4 }}>{t.map.ride_cost ?? "Cost"}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{Math.round(Math.max(1, Math.ceil(rideElapsed / 60)) * (activeRide.pricePerHour / 60)).toLocaleString("ru-RU")} &#8376;</p>
              </div>
              <button onClick={finishRide} disabled={finishing}
                style={{
                  flex: 2, padding: "14px 24px", fontSize: 13, fontWeight: 800,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  background: finishing ? "#3A0000" : "#e8002b", color: "#FFFFFF",
                  border: "1px solid #e8002b", borderRadius: 9999,
                  cursor: finishing ? "not-allowed" : "pointer", fontFamily: "inherit",
                  animation: finishing ? "none" : "pulse-glow 1.5s ease-in-out infinite",
                  opacity: finishing ? 0.7 : 1,
                }}
              >
                {finishing ? (t.map.ride_finishing ?? "Finishing...") : (t.map.ride_finish ?? "Finish Ride")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header style={{ height: 52, background: "rgba(15,17,21,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, flexShrink: 0, zIndex: 900 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#FFFFFF", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
          <ArrowLeft size={13} strokeWidth={1.5} />{t.map.back}
        </Link>

        {/* Sidebar toggle (desktop) */}
        {isDesktop && (
        <button onClick={() => setSidebarOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 10px",
            background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4,
            color: "#A0A0A0", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {sidebarOpen ? <X size={13} /> : <List size={13} />}
        </button>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, whiteSpace: "nowrap" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8002b", display: "inline-block" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#FFFFFF" }}>{availableCount} {t.map.available}</span>
          {source === "supabase" && <span style={{ fontSize: 9, color: "#A0A0A0" }}>· {t.map.live}</span>}
        </div>

        {isAdmin && (
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "rgba(232,0,43,0.08)", border: "1px solid #e8002b", borderRadius: 4, color: "#e8002b", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", flexShrink: 0 }}>Control</Link>
        )}

        <button onClick={() => setReportOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 10px",
            background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4,
            color: "#A0A0A0", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#e8002b"; e.currentTarget.style.color = "#FFFFFF" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1A1A"; e.currentTarget.style.color = "#A0A0A0" }}
        >
          <AlertTriangle size={12} strokeWidth={1.5} />{t.map.report_issue}
        </button>

        {userId ? (
          <button onClick={() => router.push("/profile")}
            style={{
              width: 32, height: 32, background: "rgba(15,17,21,0.75)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 4, color: "#FFFFFF", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#e8002b")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
          >
            {userInitial ?? <User size={14} strokeWidth={1.5} />}
          </button>
        ) : (
          <Link href="/auth" style={{
            padding: "6px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#e8002b", textDecoration: "none",
            border: "1px solid rgba(232,0,43,0.3)", borderRadius: 4,
            background: "rgba(232,0,43,0.06)", flexShrink: 0,
          }}>
            Sign In →
          </Link>
        )}
      </header>

      {/* ── Guest banner ────────────────────────────────────────────── */}
      {!userId && !guestBannerDismissed && (
        <div style={{
          background: "rgba(232,0,43,0.06)", borderBottom: "1px solid rgba(232,0,43,0.2)",
          padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 11, color: "#A0A0A0", letterSpacing: "0.04em", flexShrink: 0,
        }}>
          <span>Explore the map freely.{" "}<Link href="/auth" style={{ color: "#e8002b", textDecoration: "none", fontWeight: 700 }}>Sign in to ride.</Link></span>
          <button onClick={() => setGuestBannerDismissed(true)} style={{ background: "transparent", border: "none", color: "#A0A0A0", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
      )}

      {/* ── Body: Sidebar + Map ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Desktop sidebar */}
        {isDesktop && renderSidebar()}

        {/* Map */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          display: mobileTab === "list" ? "none" : "block",
        }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <MapView markers={filtered as any} onSelect={(m: any) => setSelected(m)} selected={selected as any} filterKey={filterKey} bookedId={bookedId} />
        </div>

        {/* Mobile list overlay */}
        {!isDesktop && mobileTab === "list" && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 900,
            display: "flex",
            flexDirection: "column", background: "rgba(15,17,21,0.75)",
          }}
        >
          {/* Mobile search + filters */}
          <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <input
              type="text" placeholder={t.map.search_placeholder}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "#121212",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#FFFFFF",
                fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", outline: "none", fontFamily: "inherit",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#e8002b")}
              onBlur={e => (e.currentTarget.style.borderColor = "#1A1A1A")}
            />
          </div>
          <div style={{ padding: "6px 10px", display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {(["all", "scooter", "ebike", "bike", "moped"] as const).map(tp => (
              <button key={tp} onClick={() => setTF(tp)}
                style={{
                  padding: "4px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase" as const,
                  border: "1px solid", borderColor: activeFilter === tp ? "#e8002b" : "#1A1A1A",
                  background: activeFilter === tp ? "rgba(232,0,43,0.08)" : "#121212",
                  color: activeFilter === tp ? "#FFFFFF" : "#A0A0A0", cursor: "pointer",
                }}
              >
                {TYPE_LABELS[tp]}
              </button>
            ))}
          </div>
          {/* Mobile vehicle cards */}
          <div className="scrollbar-hide" style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {loading ? (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {filtered.map(m => {
                  const meta = TYPE_META[m.type] ?? TYPE_META.scooter
                  const av = m.status === "available"
                  const bc = m.battery > 60 ? "#22C55E" : m.battery > 30 ? "#D97706" : "#e8002b"
                  return (
                    <button key={m.id} onClick={() => handleSidebarSelect(m)}
                      style={{
                        display: "flex", flexDirection: "column", gap: 8, padding: 12,
                        background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4,
                        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                        transition: "border-color 150ms",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#333333")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1A1A1A")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", background: meta.bg,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <meta.Icon size={14} color={meta.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{m.name}</p>
                          <p style={{ fontSize: 10, color: "#A0A0A0", marginTop: 1 }}>{m.provider} · {m.distance.toFixed(1)} km</p>
                        </div>
                        {m.isVerified && <span style={{ fontSize: 7, fontWeight: 700, color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 2, padding: "0 4px" }}>OK</span>}
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div><p style={{ fontSize: 8, fontWeight: 700, color: "#A0A0A0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Battery</p><p style={{ fontSize: 14, fontWeight: 800, color: bc }}>{m.battery}%</p></div>
                        <div><p style={{ fontSize: 8, fontWeight: 700, color: "#A0A0A0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Rate</p><p style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>{Math.round(m.pricePerHour / 60)}₸/m</p></div>
                        <div><p style={{ fontSize: 8, fontWeight: 700, color: "#A0A0A0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Status</p><p style={{ fontSize: 14, fontWeight: 800, color: av ? "#22C55E" : "#A0A0A0" }}>{av ? "OK" : "--"}</p></div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Mobile tab toggle */}
        {!isDesktop && (
        <div style={{ position: "absolute", bottom: activeRide ? 220 : selected ? 280 : 16, left: 16, zIndex: 910, display: "flex", gap: 4 }}>
          <button onClick={() => setMobileTab("map")}
            style={{
              padding: "8px 14px", borderRadius: 4, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid",
              borderColor: mobileTab === "map" ? "#e8002b" : "#1A1A1A",
              background: mobileTab === "map" ? "rgba(232,0,43,0.08)" : "#0A0A0A",
              color: mobileTab === "map" ? "#FFFFFF" : "#A0A0A0",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit",
            }}
          >
            <MapPin size={12} />Map
          </button>
          <button onClick={() => setMobileTab("list")}
            style={{
              padding: "8px 14px", borderRadius: 4, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid",
              borderColor: mobileTab === "list" ? "#e8002b" : "#1A1A1A",
              background: mobileTab === "list" ? "rgba(232,0,43,0.08)" : "#0A0A0A",
              color: mobileTab === "list" ? "#FFFFFF" : "#A0A0A0",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit",
            }}
          >
            <List size={12} />List
          </button>
        </div>
        )}
      </div>

      {/* ── Detail panel (selected vehicle) ──────────────────────────── */}
      {selected && !activeRide && (() => {
        const v = selected
        const bc = v.battery > 60 ? "#22C55E" : v.battery > 30 ? "#D97706" : "#e8002b"
        const rng = Math.round(v.battery * 0.6)
        const pm = Math.round(v.pricePerHour / 60)
        const av = v.status === "available"
        return (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 950, background: "rgba(15,17,21,0.75)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ height: 2, background: "linear-gradient(90deg,#e8002b,transparent)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", maxWidth: 900, margin: "0 auto" }}>
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.05)", background: "rgba(232,0,43,0.03)", minWidth: 160 }}>
                <VehicleIllustration type={v.type} size={130} color={av ? "#FFFFFF" : "#555555"} />
              </div>
              <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "#e8002b", textTransform: "uppercase" }}>{t.map[`type_${v.type}` as keyof typeof t.map]}</p>
                      {v.isVerified && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "#22C55E", textTransform: "uppercase", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 2, padding: "1px 5px" }}>{t.map.panel_verified}</span>}
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.02em", color: "#FFFFFF", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</p>
                    <p style={{ fontSize: 11, color: "#A0A0A0", marginTop: 2 }}>{v.provider}</p>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, flexShrink: 0, background: "transparent", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#A0A0A0", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }} onMouseEnter={e => (e.currentTarget.style.borderColor = "#e8002b")} onMouseLeave={e => (e.currentTarget.style.borderColor = "#1A1A1A")}>&#x2715;</button>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 80 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Battery size={12} strokeWidth={1.5} color={bc} /><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#A0A0A0", textTransform: "uppercase" }}>{t.map.panel_battery}</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: bc, letterSpacing: "-0.02em" }}>{v.battery}%</span>
                      <div style={{ width: 36, height: 4, background: "#1A1A1A", borderRadius: 2 }}><div style={{ width: `${v.battery}%`, height: "100%", background: bc, borderRadius: 2 }} /></div>
                    </div>
                  </div>
                  {v.type !== "bike" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Navigation size={12} strokeWidth={1.5} color="#A0A0A0" /><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#A0A0A0", textTransform: "uppercase" }}>{t.map.panel_range}</span></div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{rng} <span style={{ fontSize: 11, fontWeight: 400, color: "#A0A0A0" }}>{t.map.panel_km}</span></span>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={12} strokeWidth={1.5} color="#A0A0A0" /><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#A0A0A0", textTransform: "uppercase" }}>{t.map.panel_rate}</span></div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{pm} <span style={{ fontSize: 11, fontWeight: 400, color: "#A0A0A0" }}>{t.map.panel_price_min}</span></span>
                  </div>
                  {v.rating > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Star size={12} strokeWidth={1.5} color="#A0A0A0" /><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#A0A0A0", textTransform: "uppercase" }}>{t.map.panel_rating}</span></div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{v.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
                  {isBooked ? (
                    <button onClick={cancelBooking} style={{ flex: 1, padding: "11px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "#e8002b", border: "1px solid #e8002b", borderRadius: 9999, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(232,0,43,0.1)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      {t.map.btn_cancel_booking} &middot; {fmtCD(bookingTime)}
                    </button>
                  ) : av ? (
                    <>
                      <button onClick={() => reserveVehicle(v)} style={{ flex: 1, padding: "11px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9999, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#e8002b"; e.currentTarget.style.background = "rgba(232,0,43,0.08)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}>
                        {t.map.btn_book_reserve}
                      </button>
                      <button onClick={() => startRide(v)} style={{ flex: 2, padding: "12px 24px", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "#e8002b", color: "#FFFFFF", border: "1px solid #e8002b", borderRadius: 9999, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 20px rgba(232,0,43,0.4),0 0 40px rgba(232,0,43,0.15)" }} onMouseEnter={e => { e.currentTarget.style.background = "#A30000"; e.currentTarget.style.boxShadow = "0 0 32px rgba(139,0,0,0.6),0 0 60px rgba(139,0,0,0.25)" }} onMouseLeave={e => { e.currentTarget.style.background = "#e8002b"; e.currentTarget.style.boxShadow = "0 0 20px rgba(232,0,43,0.4),0 0 40px rgba(232,0,43,0.15)" }}>
                        {t.map.btn_start_ride}
                      </button>
                    </>
                  ) : (
                    <button disabled style={{ flex: 1, padding: "12px 24px", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "#1A1A1A", color: "#555555", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9999, cursor: "not-allowed", fontFamily: "inherit" }}>
                      {t.map.btn_unavailable}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Active booking bar ─────────────────────────────────────── */}
      {activeBooking && !selected && !activeRide && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 940, background: "rgba(232,0,43,0.08)", borderTop: "1px solid #e8002b", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8002b", display: "inline-block", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "#A0A0A0", textTransform: "uppercase", marginBottom: 2 }}>{t.map.booking_active}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeBooking.name}</p>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", fontVariantNumeric: "tabular-nums", flexShrink: 0, fontFamily: "'Courier New',monospace" }}>{fmtCD(bookingTime)}</span>
          <button onClick={cancelBooking} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 11, flexShrink: 0 }}>{t.map.booking_cancel}</button>
        </div>
      )}

      {/* ── Report modal ────────────────────────────────────────────── */}
      {reportOpen && (
        <>
          <div onClick={() => setReportOpen(false)} style={{ position: "absolute", inset: 0, zIndex: 1050, background: "rgba(0,0,0,0.75)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1060, width: "min(420px,calc(100vw - 32px))", background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, padding: "28px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "#e8002b", textTransform: "uppercase", marginBottom: 4 }}>RideHub</p>
                <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FFFFFF" }}>{t.map.report_title}</h2>
              </div>
              <button onClick={() => setReportOpen(false)} style={{ width: 28, height: 28, background: "transparent", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#A0A0A0", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }} onMouseEnter={e => (e.currentTarget.style.borderColor = "#e8002b")} onMouseLeave={e => (e.currentTarget.style.borderColor = "#1A1A1A")}>&#x2715;</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#A0A0A0", marginBottom: 6 }}>{t.map.report_type}</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: "100%", padding: "9px 12px", background: "rgba(15,17,21,0.75)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#FFFFFF", fontSize: 12, outline: "none", fontFamily: "inherit", cursor: "pointer" }} onFocus={e => (e.currentTarget.style.borderColor = "#e8002b")} onBlur={e => (e.currentTarget.style.borderColor = "#1A1A1A")}>
                <option value="battery">{t.map.report_type_battery}</option>
                <option value="damage">{t.map.report_type_damage}</option>
                <option value="location">{t.map.report_type_location}</option>
                <option value="other">{t.map.report_type_other}</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#A0A0A0", marginBottom: 6 }}>{t.map.report_vehicle}</label>
              <input type="text" value={reportVehicle} onChange={e => setReportVehicle(e.target.value)} placeholder={selected?.name ?? "e.g. Xiaomi Pro 2"} style={{ width: "100%", padding: "9px 12px", background: "rgba(15,17,21,0.75)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#FFFFFF", fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => (e.currentTarget.style.borderColor = "#e8002b")} onBlur={e => (e.currentTarget.style.borderColor = "#1A1A1A")} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#A0A0A0", marginBottom: 6 }}>{t.map.report_message}</label>
              <textarea value={reportMessage} onChange={e => setReportMessage(e.target.value)} placeholder={t.map.report_placeholder} rows={3} style={{ width: "100%", padding: "9px 12px", background: "rgba(15,17,21,0.75)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#FFFFFF", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => (e.currentTarget.style.borderColor = "#e8002b")} onBlur={e => (e.currentTarget.style.borderColor = "#1A1A1A")} />
            </div>
            <button onClick={submitReport} disabled={reportSending || !reportMessage.trim()} className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 12 }}>
              {reportSending ? t.map.report_submitting : t.map.report_submit}
            </button>
          </div>
        </>
      )}

      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 1100, pointerEvents: "none" }}>
          <div style={{ padding: "8px 18px", background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, color: "#FFFFFF", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{toast}</div>
        </div>
      )}
    </div>
  )
}
