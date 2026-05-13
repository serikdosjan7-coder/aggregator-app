"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Zap, MapPin, CreditCard, ChevronDown } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { LangSwitcher } from "@/components/LangSwitcher"
import { LuxuryButton } from "@/components/LuxuryButton"
import { AppFooter } from "@/components/AppFooter"

/* ── Feature card data ─────────────────────────────────────────────────── */
const FEATURE_ICONS = [
  <Zap     key="zap"  size={28} strokeWidth={1}   color="#8B0000" />,
  <MapPin  key="pin"  size={28} strokeWidth={1}   color="#8B0000" />,
  <CreditCard key="card" size={28} strokeWidth={1} color="#8B0000" />,
]

/* Punchy one-word titles override the i18n copy for the luxury aesthetic */
const LUXURY_TITLES = ["Velocity", "Precision", "Control"]

/* ── Stagger container variants ────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const heroVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

/* ── Scroll-triggered section wrapper ─────────────────────────────────── */
function InViewSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { t } = useI18n()

  return (
    <>
      <style>{`
        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(8px); }
        }
        .scroll-arrow { animation: bounce-arrow 2s ease-in-out infinite; }

        @media (max-width: 640px) {
          .landing-h1   { font-size: clamp(3rem, 14vw, 5rem) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .features-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .features-grid > div:last-child { border-bottom: none; }
          .footer-nav   { flex-direction: column !important; gap: 16px !important; }
        }
      `}</style>

      <div style={{ overflowY: "scroll", scrollSnapType: "y mandatory", height: "100vh", background: "#000000" }}>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1 — HERO
        ════════════════════════════════════════════════════════════════ */}
        <section style={{
          scrollSnapAlign: "start",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          textAlign: "center",
          overflow: "hidden",
        }}>

          {/* Background video — muted autoplay loop, poster fallback */}
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/hero-poster.jpg"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity: 0.18,
              pointerEvents: "none",
            }}
          >
            {/* Drop a .mp4 into /public/hero.mp4 to activate */}
            <source src="/hero.mp4" type="video/mp4" />
          </video>

          {/* Dark vignette overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, transparent 30%, #000000 100%)",
            pointerEvents: "none",
          }} />

          {/* Top-right controls */}
          <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
            <LangSwitcher />
          </div>

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1 }}>

            {/* Wordmark */}
            <motion.p
              custom={0}
              initial="hidden"
              animate="visible"
              variants={heroVariants}
              style={{
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.35em", color: "#8B0000",
                textTransform: "uppercase", marginBottom: 40,
              }}
            >
              {t.landing.wordmark}
            </motion.p>

            {/* H1 — huge, ultra-thin tracking */}
            <motion.h1
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={heroVariants}
              className="landing-h1"
              style={{
                fontSize: "clamp(3.5rem, 12vw, 8rem)",
                fontWeight: 200,              /* ultra-thin — luxury feel */
                letterSpacing: "-0.03em",     /* tight tracking */
                lineHeight: 0.95,
                color: "#FFFFFF",
                marginBottom: 28,
                maxWidth: 900,
              }}
            >
              {t.landing.headline_1}
              <br />
              <span style={{ fontWeight: 700, color: "#FFFFFF" }}>
                {t.landing.headline_2}
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              custom={0.25}
              initial="hidden"
              animate="visible"
              variants={heroVariants}
              style={{
                fontSize: 15, color: "#A0A0A0",
                maxWidth: 420, lineHeight: 1.8,
                marginBottom: 52, margin: "0 auto 52px",
              }}
            >
              {t.landing.subheadline}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              custom={0.4}
              initial="hidden"
              animate="visible"
              variants={heroVariants}
              style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
            >
              <LuxuryButton href="/auth" variant="primary">
                {t.landing.cta}
              </LuxuryButton>
              <LuxuryButton href="/map" variant="ghost">
                {t.landing.view_map}
              </LuxuryButton>
            </motion.div>
          </div>

          {/* Animated scroll-down arrow */}
          <div
            className="scroll-arrow"
            style={{
              position: "absolute", bottom: 36,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}
          >
            <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "#333333", textTransform: "uppercase" }}>
              {t.landing.scroll_hint}
            </p>
            <ChevronDown size={16} strokeWidth={1} color="#333333" />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — FEATURES
        ════════════════════════════════════════════════════════════════ */}
        <section style={{
          scrollSnapAlign: "start",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 0",
          position: "relative",
        }}>

          {/* Top-right controls */}
          <div style={{ position: "absolute", top: 20, right: 20 }}>
            <LangSwitcher />
          </div>

          {/* Section eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.3em", color: "#8B0000",
              textTransform: "uppercase", marginBottom: 20,
            }}
          >
            {t.landing.section_label}
          </motion.p>

          {/* Section headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 200,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 64,
              lineHeight: 1.1,
            }}
          >
            {t.landing.section_h2_1}
            <br />
            <span style={{ fontWeight: 700 }}>{t.landing.section_h2_2}</span>
          </motion.h2>

          {/* Feature cards — staggered fade-in */}
          <InViewSection style={{ width: "100%", maxWidth: 960 }}>
            <div
              className="features-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {t.landing.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={cardVariants}
                  style={{
                    padding: "44px 32px",
                    background: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    cursor: "default",
                  }}
                >
                  {/* Icon */}
                  <div style={{ marginBottom: 24 }}>{FEATURE_ICONS[i]}</div>

                  {/* Punchy one-word title */}
                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 300,
                    letterSpacing: "-0.01em",
                    color: "#FFFFFF",
                    marginBottom: 12,
                  }}>
                    {LUXURY_TITLES[i]}
                  </h3>

                  {/* i18n description */}
                  <p style={{ fontSize: 13, color: "#A0A0A0", lineHeight: 1.75 }}>
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </InViewSection>

          {/* Footer */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <AppFooter />
          </div>
        </section>

      </div>
    </>
  )
}
