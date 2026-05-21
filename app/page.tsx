"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useInView, useMotionValue, useTransform } from "framer-motion"
import {
  Zap, MapPin, CreditCard, ChevronDown, ArrowRight,
  Gauge, Wifi, Navigation2, Bike,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { LangSwitcher } from "@/components/LangSwitcher"
import { LuxuryButton } from "@/components/LuxuryButton"
import { AppFooter } from "@/components/AppFooter"

/* ── Color system (Porsche digital) ─────────────────────────────────────── */
const C = {
  bg:       "#0b0c10",
  surface:  "#121212",
  graphite: "#1f2022",
  border:   "#2a2b2d",
  accent:   "#E30613",
  green:    "#39FF14",
  text:     "#FFFFFF",
  muted:    "#6b7280",
  dim:      "#3a3b3d",
}

/* ── Animation variants ────────────────────────────────────────────────── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const heroLine = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 } },
}

/* ── InView wrapper ─────────────────────────────────────────────────────── */
function Reveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} style={style}>
      {children}
    </motion.div>
  )
}

/* ── Animated grid background ──────────────────────────────────────────── */
function GeometricGrid() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
    </div>
  )
}

/* ── Mouse-tracking radial aura ────────────────────────────────────────── */
function PerformanceAura() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const bgX = useTransform(mouseX, [0, 1], ["30%", "70%"])
  const bgY = useTransform(mouseY, [0, 1], ["30%", "70%"])

  const handleMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }, [mouseX, mouseY])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("mousemove", handleMove)
    return () => el.removeEventListener("mousemove", handleMove)
  }, [handleMove])

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <motion.div
        style={{
          position: "absolute", width: "60vmax", height: "60vmax",
          left: bgX, top: bgY, transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(227,6,19,0.08) 0%, rgba(227,6,19,0.02) 40%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
      <motion.div
        style={{
          position: "absolute", width: "40vmax", height: "40vmax",
          left: bgX, top: bgY, transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(57,255,20,0.03) 0%, transparent 60%)",
          borderRadius: "50%",
        }}
      />
    </div>
  )
}

/* ── Porsche-style CTA button ──────────────────────────────────────────── */
function CockpitButton({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: "16px 44px",
        background: hovered ? "#E30613" : "transparent",
        border: `1.5px solid ${hovered ? "#E30613" : "#2a2b2d"}`,
        color: "#FFFFFF", borderRadius: 2,
        fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
        textTransform: "uppercase", textDecoration: "none", cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: hovered
          ? "0 0 32px rgba(227,6,19,0.4), 0 0 64px rgba(227,6,19,0.15), inset 0 0 24px rgba(227,6,19,0.1)"
          : "none",
      }}
    >
      {children}
      <ArrowRight size={14} strokeWidth={2} style={{ transition: "transform 300ms", transform: hovered ? "translateX(4px)" : "translateX(0)" }} />
    </a>
  )
}

/* ── Feature data ──────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Zap size={26} strokeWidth={1} color={C.accent} />, title: "Instant Analytics", desc: "Real-time fleet telemetry with sub-second updates. Monitor every vehicle, every ride, every charge cycle." },
  { icon: <Wifi size={26} strokeWidth={1} color={C.accent} />, title: "Supabase Real-time Sync", desc: "Live data streams powered by Postgres change feeds. Your dashboard updates before the vehicle moves." },
  { icon: <Navigation2 size={26} strokeWidth={1} color={C.accent} />, title: "Advanced Mapping", desc: "Leaflet-powered dark map with custom markers, fly-to navigation, and proximity-based clustering." },
]

/* ── Fleet categories ───────────────────────────────────────────────────── */
type FleetCat = "scooter" | "ebike" | "moped"

const FLEET: Record<FleetCat, {
  label: string; icon: React.ReactNode; topSpeed: string;
  units: string; range: string; accent: string;
}> = {
  scooter: {
    label: "Scooters", icon: <Zap size={28} strokeWidth={1.2} />,
    topSpeed: "25 km/h", units: "1,240+", range: "45 km", accent: C.accent,
  },
  ebike: {
    label: "E-Bikes", icon: <Bike size={28} strokeWidth={1.2} />,
    topSpeed: "35 km/h", units: "680+", range: "80 km", accent: "#D97706",
  },
  moped: {
    label: "Mopeds", icon: <Gauge size={28} strokeWidth={1.2} />,
    topSpeed: "55 km/h", units: "320+", range: "120 km", accent: "#0F766E",
  },
}

/* ── Feature card with hover glow ──────────────────────────────────────── */
function FeatureCard({ icon, title, desc, index }: {
  icon: React.ReactNode; title: string; desc: string; index: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={fadeUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "44px 32px",
        background: hovered ? "rgba(227,6,19,0.02)" : C.surface,
        borderRight: index < 2 ? `1px solid ${C.border}` : "none",
        transition: "all 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "default",
        boxShadow: hovered
          ? `0 8px 32px rgba(227,6,19,0.06), 0 0 0 1px rgba(227,6,19,0.2)`
          : "none",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        border: `1px solid ${hovered ? "rgba(227,6,19,0.2)" : "transparent"}`,
        transition: "border-color 500ms",
      }} />

      <div style={{ marginBottom: 24, transition: "transform 500ms", transform: hovered ? "translateY(-2px)" : "none" }}>
        {icon}
      </div>

      <h3 style={{
        fontSize: 16, fontWeight: 700,
        letterSpacing: "0.06em", color: C.text,
        textTransform: "uppercase", marginBottom: 12,
      }}>
        {title}
      </h3>

      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{desc}</p>
    </motion.div>
  )
}

/* ── Instrument gauge ──────────────────────────────────────────────────── */
function InstrumentGauge({ label, value, accent, activeFleet, isDesktop }: {
  label: string; value: string; accent: string; activeFleet: string; isDesktop: boolean
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px 8px", textAlign: "center",
    }}>
      <motion.div
        key={`dot-${activeFleet}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: accent, marginBottom: 16,
          boxShadow: `0 0 8px ${accent}66`,
        }}
      />
      <motion.p
        key={`val-${activeFleet}-${value}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: isDesktop ? 28 : 22, fontWeight: 800,
          letterSpacing: "-0.02em", color: C.text,
          fontVariantNumeric: "tabular-nums", marginBottom: 8,
        }}
      >
        {value}
      </motion.p>
      <p style={{
        fontSize: 9, fontWeight: 700,
        letterSpacing: "0.18em", color: C.muted,
        textTransform: "uppercase",
      }}>
        {label}
      </p>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { t } = useI18n()
  const [activeFleet, setActiveFleet] = useState<FleetCat>("scooter")
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    function check() { setIsDesktop(window.innerWidth >= 768) }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const fleet = FLEET[activeFleet]

  return (
    <div style={{ background: C.bg, color: C.text, overflowX: "hidden" }}>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═════════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh", position: "relative",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 24px", textAlign: "center", overflow: "hidden",
      }}>
        <GeometricGrid />
        <PerformanceAura />

        {/* Dark vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 40%, transparent 20%, #0b0c10 75%)",
        }} />

        {/* Top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "20px 24px", display: "flex",
          justifyContent: "space-between", alignItems: "center", zIndex: 10,
        }}>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.35em",
              color: C.accent, textTransform: "uppercase",
            }}
          >
            RideHub
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <LangSwitcher />
          </motion.div>
        </div>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 960 }}>
          {/* Accent line */}
          <motion.div
            variants={heroLine} initial="hidden" animate="visible"
            style={{
              width: 64, height: 1, background: C.accent,
              margin: "0 auto 40px", transformOrigin: "center",
            }}
          />

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            style={{
              fontSize: isDesktop ? "clamp(2.8rem, 6vw, 5.5rem)" : "clamp(2.2rem, 10vw, 3.5rem)",
              fontWeight: 700, letterSpacing: isDesktop ? "-0.03em" : "-0.02em",
              lineHeight: 1.05, color: C.text, marginBottom: 12,
            }}
          >
            Engineered for
            <br />
            <span style={{ color: C.accent }}>Urban Mobility.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{
              fontSize: isDesktop ? "clamp(1rem, 2vw, 1.25rem)" : "clamp(0.9rem, 3.5vw, 1.1rem)",
              fontWeight: 300, letterSpacing: "0.02em",
              color: "#9ca3af", maxWidth: 520, margin: "0 auto 20px", lineHeight: 1.6,
            }}
          >
            All eco-transport in one app.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            style={{
              fontSize: 12, color: C.muted,
              letterSpacing: "0.04em", maxWidth: 440,
              margin: "0 auto 48px", lineHeight: 1.7,
            }}
          >
            {t.landing.subheadline}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <CockpitButton href="/auth">{t.landing.cta}</CockpitButton>
            <LuxuryButton href="/map" variant="ghost">{t.landing.view_map}</LuxuryButton>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{
            position: "absolute", bottom: 36,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}
        >
          <p style={{ fontSize: 8, letterSpacing: "0.3em", color: C.dim, textTransform: "uppercase" }}>
            {t.landing.scroll_hint}
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown size={14} strokeWidth={1} color={C.dim} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 2 — PERFORMANCE & FEATURE SHOWCASE GRID
      ═════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: C.surface,
        padding: isDesktop ? "120px 24px" : "80px 20px",
        position: "relative",
      }}>
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 64, height: 1, background: C.accent }} />

        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Reveal>
            <motion.p variants={fadeUp} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.35em",
              color: C.accent, textTransform: "uppercase", marginBottom: 16, textAlign: "center",
            }}>
              {t.landing.section_label}
            </motion.p>

            <motion.h2 variants={fadeUp} style={{
              fontSize: isDesktop ? "clamp(2rem, 4vw, 3rem)" : "clamp(1.6rem, 7vw, 2.2rem)",
              fontWeight: 700, letterSpacing: "-0.02em",
              color: C.text, textAlign: "center", marginBottom: 12, lineHeight: 1.1,
            }}>
              {t.landing.section_h2_1}
              <br />
              <span style={{ fontWeight: 300, color: "#9ca3af" }}>{t.landing.section_h2_2}</span>
            </motion.h2>

            <motion.div variants={fadeUp} style={{
              width: 40, height: 1, background: C.accent, margin: "0 auto 64px",
            }} />
          </Reveal>

          {/* Feature grid */}
          <Reveal>
            <div style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
              gap: 1, background: C.border, borderRadius: 2, overflow: "hidden",
            }}>
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} index={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 3 — ACTIVE FLEET PREVIEW (Configurator)
      ═════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: C.bg,
        padding: isDesktop ? "120px 24px" : "80px 20px",
        position: "relative",
      }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 64, height: 1, background: C.accent }} />

        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Reveal>
            <motion.p variants={fadeUp} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.35em",
              color: C.accent, textTransform: "uppercase", marginBottom: 16, textAlign: "center",
            }}>
              Fleet Configurator
            </motion.p>

            <motion.h2 variants={fadeUp} style={{
              fontSize: isDesktop ? "clamp(2rem, 4vw, 3rem)" : "clamp(1.6rem, 7vw, 2.2rem)",
              fontWeight: 700, letterSpacing: "-0.02em",
              color: C.text, textAlign: "center", marginBottom: 12, lineHeight: 1.1,
            }}>
              Active Fleet.
              <br />
              <span style={{ fontWeight: 300, color: "#9ca3af" }}>At a glance.</span>
            </motion.h2>

            <motion.div variants={fadeUp} style={{
              width: 40, height: 1, background: C.accent, margin: "0 auto 64px",
            }} />
          </Reveal>

          {/* Category selector tabs */}
          <Reveal>
            <div style={{
              display: "flex", justifyContent: "center", gap: 0,
              border: `1px solid ${C.border}`, borderRadius: 2,
              overflow: "hidden", marginBottom: 48, background: C.surface,
            }}>
              {(Object.keys(FLEET) as FleetCat[]).map((cat, i) => {
                const isActive = activeFleet === cat
                return (
                  <motion.button
                    key={cat}
                    variants={fadeUp}
                    onClick={() => setActiveFleet(cat)}
                    style={{
                      flex: 1, padding: isDesktop ? "16px 32px" : "14px 16px",
                      background: isActive ? "rgba(227,6,19,0.06)" : "transparent",
                      border: "none",
                      borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                      color: isActive ? C.accent : C.muted,
                      fontSize: 11, fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 200ms", position: "relative",
                    }}
                  >
                    <span style={{ color: isActive ? C.accent : C.dim }}>{FLEET[cat].icon}</span>
                    <span>{FLEET[cat].label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="fleet-indicator"
                        style={{
                          position: "absolute", bottom: 0, left: "10%", right: "10%",
                          height: 2, background: C.accent, borderRadius: 1,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </Reveal>

          {/* Instrument cluster display */}
          <Reveal>
            <div style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "1fr 2fr" : "1fr",
              gap: 24,
              border: `1px solid ${C.border}`, borderRadius: 2,
              padding: isDesktop ? 48 : 28, background: C.surface,
            }}>
              {/* Left — category hero */}
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "24px 16px",
                border: isDesktop ? `1px solid ${C.border}` : "none",
                borderRadius: 2,
                background: isDesktop ? "rgba(227,6,19,0.02)" : "transparent",
                marginBottom: isDesktop ? 0 : 24,
              }}>
                <motion.div
                  key={`icon-${activeFleet}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: 80, height: 80, borderRadius: "50%",
                    border: `1.5px solid ${fleet.accent}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20, color: fleet.accent,
                    boxShadow: `0 0 24px ${fleet.accent}22, inset 0 0 16px ${fleet.accent}11`,
                  }}
                >
                  {fleet.icon}
                </motion.div>
                <motion.p
                  key={`label-${activeFleet}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: 18, fontWeight: 700,
                    letterSpacing: "0.04em", color: C.text, textTransform: "uppercase",
                  }}
                >
                  {fleet.label}
                </motion.p>
                <div style={{ width: 32, height: 1, background: fleet.accent, marginTop: 12 }} />
              </div>

              {/* Right — instrument gauges */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: isDesktop ? 32 : 16,
                alignItems: "center",
              }}>
                <InstrumentGauge label="Top Speed" value={fleet.topSpeed} accent={fleet.accent} activeFleet={activeFleet} isDesktop={isDesktop} />
                <InstrumentGauge label="Available Units" value={fleet.units} accent={fleet.accent} activeFleet={activeFleet} isDesktop={isDesktop} />
                <InstrumentGauge label="Battery Range" value={fleet.range} accent={fleet.accent} activeFleet={activeFleet} isDesktop={isDesktop} />
              </div>
            </div>
          </Reveal>

          {/* Fleet CTA */}
          <Reveal>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <CockpitButton href="/map">Explore Fleet</CockpitButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <AppFooter />
      </div>
    </div>
  )
}
