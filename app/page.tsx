"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────────────────────────────────
   RideHub — Landing Page  v3
   Multi-rental: Scooters · E-Bikes · Mopeds
   Design: Porsche Digital · Matte Black · Guards Red · Electric Blue
───────────────────────────────────────────────────────────────────────── */

const C = {
  bg:      "#0a0a0b",
  s1:      "#111113",
  s2:      "#18181b",
  s3:      "#222226",
  border:  "#2a2a2e",
  border2: "#38383e",
  red:     "#e8002b",
  red2:    "#ff1a3d",
  reddim:  "rgba(232,0,43,0.12)",
  blue:    "#00cfff",
  bluedim: "rgba(0,207,255,0.10)",
  green:   "#00e676",
  amber:   "#ffab00",
  w:       "#f4f4f5",
  gray:    "#71717a",
  gray2:   "#52525b",
}

/* ── Types ── */
type VehicleType = "scooter" | "ebike" | "moped"
type PlanType    = "start"   | "pro"   | "biz"

/* ── Data ── */
const VEHICLES: Record<VehicleType, {
  emoji: string; name: string; desc: string;
  speed: number; range: number; units: string; accent: string; bg: string;
}> = {
  scooter: {
    emoji: "⚡", name: "Taycan Scooter",
    desc: "Лёгкий электросамокат для маршрутов до 8 км. Идеален для «последней мили» — от метро до офиса.",
    speed: 25, range: 45, units: "1,240+", accent: C.red, bg: C.reddim,
  },
  ebike: {
    emoji: "🚲", name: "E-Tron Bike",
    desc: "Электровелосипед с педальным ассистом для длинных прогулок по паркам и проспектам города.",
    speed: 35, range: 80, units: "680+", accent: "#f59e0b", bg: "rgba(245,158,11,0.1)",
  },
  moped: {
    emoji: "🛵", name: "Urban Moped",
    desc: "Мощный электромопед для тех, кто торопится. Быстро, тихо — для уверенного городского движения.",
    speed: 55, range: 120, units: "320+", accent: C.blue, bg: C.bluedim,
  },
}

const STATS = [
  { val: "2,400+", lbl: "ТС в сети" },
  { val: "7",      lbl: "Районов Алматы" },
  { val: "180k",   lbl: "Поездок в месяц" },
  { val: "99.8%",  lbl: "Uptime платформы" },
  { val: "4.9★",   lbl: "Рейтинг App Store" },
]

const STEPS = [
  { num: "01", icon: "📱", title: "Скачай приложение",    desc: "App Store или Google Play. Регистрация по номеру телефона — никаких лишних данных." },
  { num: "02", icon: "📍", title: "Найди транспорт",      desc: "Карта в реальном времени показывает все доступные самокаты, байки и мопеды рядом." },
  { num: "03", icon: "🔓", title: "Сканируй QR",          desc: "Наведи камеру — замок открыт. Поездка начинается мгновенно, оплата автоматически." },
  { num: "04", icon: "🏁", title: "Оставь в зоне",        desc: "Завершай поездку в любой разрешённой точке. Чек — в приложении, история — в профиле." },
]

const ZONES = [
  { name: "Аль-Фараби",          meta: "240 единиц · 12 станций", count: 240, color: C.red   },
  { name: "Абая",                meta: "189 единиц · 9 станций",  count: 189, color: C.blue  },
  { name: "Медеу / Горный Гигант", meta: "124 единицы · 7 станций", count: 124, color: C.green },
  { name: "Бостандык / Коктем",  meta: "98 единиц · 5 станций",   count: 98,  color: C.amber },
  { name: "Достык / Самал",      meta: "76 единиц · 4 станции",   count: 76,  color: C.blue  },
]

const REVIEWS = [
  {
    text: "Пользуюсь каждый день от Алатауской до офиса на Достыке. 20 минут вместо 50 в пробках. Теперь не понимаю, как раньше жил без этого.",
    name: "Арман М.", meta: "Алматы · 3 месяца",  initials: "АМ", color: C.red,
  },
  {
    text: "Взяла Pro-тариф — окупился за неделю. Байки всегда заряжены, приложение работает без сбоев. Дизайн вообще отдельный кайф.",
    name: "Диана А.", meta: "Алматы · 5 месяцев", initials: "ДА", color: C.blue,
  },
  {
    text: "Корпоративный тариф оформили на весь отдел из 12 человек. Затраты на такси упали на 60%. Рекомендую каждой компании в центре города.",
    name: "Серик К.", meta: "CEO · Almaty Tech",   initials: "СК", color: C.green,
  },
]

/* ─────────────────────────── Sub-components ─────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 10, fontWeight: 700, letterSpacing: ".2em",
      textTransform: "uppercase", color: C.red, marginBottom: 20,
    }}>
      <span style={{ width: 32, height: 1, background: C.red, display: "block" }} />
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: "clamp(2rem, 4vw, 3.2rem)",
      fontWeight: 800, letterSpacing: "-.03em",
      lineHeight: 1.1, marginBottom: 56, color: C.w,
    }}>
      {children}
    </h2>
  )
}

function BtnRed({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
  const style: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "14px 36px", background: C.red, border: "none",
    borderRadius: 6, fontSize: 13, fontWeight: 700,
    letterSpacing: ".1em", textTransform: "uppercase", color: "#fff",
    cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
    transition: "all .2s",
  }
  if (href) return <Link href={href} style={style}>{children} →</Link>
  return <button style={style} onClick={onClick}>{children} →</button>
}

function BtnGhost({ href, children }: { href?: string; children: React.ReactNode }) {
  const style: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "14px 36px", background: "transparent",
    border: `1px solid ${C.border2}`, borderRadius: 6,
    fontSize: 13, fontWeight: 700, letterSpacing: ".1em",
    textTransform: "uppercase", color: C.w,
    cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
    transition: "all .2s",
  }
  if (href) return <Link href={href} style={style}>{children}</Link>
  return <button style={style}>{children}</button>
}

/* ─────────────────────────── Navbar ─────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(10,10,11,.96)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: 64,
      transition: "all .3s",
    }}>
      <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: ".05em", color: C.w }}>
        RIDE<span style={{ color: C.red }}>HUB</span>
      </div>

      <div style={{ display: "flex", gap: 32 }}>
        {["Транспорт", "Тарифы", "Карта", "Операторам"].map(l => (
          <a key={l} href="#" style={{
            fontSize: 12, fontWeight: 600, letterSpacing: ".06em",
            textTransform: "uppercase", color: C.gray,
            textDecoration: "none", transition: "color .2s",
          }}>{l}</a>
        ))}
      </div>

      <Link href="/auth" style={{
        padding: "9px 24px", background: C.red, border: "none",
        borderRadius: 5, fontSize: 11, fontWeight: 700,
        letterSpacing: ".1em", textTransform: "uppercase",
        color: "#fff", cursor: "pointer", textDecoration: "none",
        transition: "all .2s",
      }}>
        Войти →
      </Link>
    </nav>
  )
}

/* ─────────────────────────── Hero ─────────────────────────── */
function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", position: "relative",
      overflow: "hidden", padding: "120px 32px 140px", textAlign: "center",
    }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.028) 1px,transparent 1px),
          linear-gradient(90deg,rgba(255,255,255,0.028) 1px,transparent 1px)`,
        backgroundSize: "64px 64px",
      }} />

      {/* Glows */}
      <div style={{
        position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 500, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse,rgba(232,0,43,.11) 0%,transparent 65%)",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: 500, height: 500, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse,rgba(0,207,255,.06) 0%,transparent 60%)",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
        {/* Eyebrow pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(232,0,43,.08)", border: "1px solid rgba(232,0,43,.2)",
          borderRadius: 100, padding: "6px 16px", marginBottom: 36,
          fontSize: 11, fontWeight: 700, letterSpacing: ".12em",
          textTransform: "uppercase", color: C.red,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: C.red,
            animation: "ridehub-blink 2s infinite",
          }} />
          Алматы · 2025 · 24 / 7
        </div>

        <h1 style={{
          fontSize: "clamp(3rem, 7.5vw, 7rem)", fontWeight: 900,
          letterSpacing: "-.04em", lineHeight: 1.0,
          color: C.w, marginBottom: 24,
        }}>
          Весь город —<br />
          <span style={{ color: C.red }}>твой маршрут.</span>
        </h1>

        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.25rem)", fontWeight: 300,
          color: C.gray, maxWidth: 480, margin: "0 auto 20px", lineHeight: 1.65,
        }}>
          Самокаты, велосипеды, мопеды. Один QR — поехал.
          Без очередей, без пробок, без лишнего.
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 52 }}>
          {["⚡ Электросамокаты", "🚲 E-Байки", "🛵 Мопеды", "📍 GPS-трекинг", "🔋 Быстрая зарядка"].map(t => (
            <span key={t} style={{
              padding: "5px 14px", borderRadius: 100,
              border: `1px solid ${C.border2}`,
              fontSize: 12, color: C.gray, letterSpacing: ".04em",
            }}>{t}</span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <BtnRed href="/auth">Начать поездку</BtnRed>
          <BtnGhost href="/map">Карта транспорта</BtnGhost>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 1, height: 52, background: `linear-gradient(${C.red}, transparent)` }} />
        <span style={{ fontSize: 9, letterSpacing: ".25em", color: C.gray2, textTransform: "uppercase" }}>
          Прокрутить
        </span>
      </div>

      <style>{`
        @keyframes ridehub-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </section>
  )
}

/* ─────────────────────────── Stats Bar ─────────────────────────── */
function StatsBar() {
  return (
    <div style={{
      background: C.s1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: "24px 40px", display: "flex", justifyContent: "center",
      gap: 0, flexWrap: "wrap",
    }}>
      {STATS.map((s, i) => (
        <div key={s.lbl} style={{
          flex: 1, minWidth: 120, maxWidth: 200, textAlign: "center",
          padding: "12px 20px",
          borderRight: i < STATS.length - 1 ? `1px solid ${C.border}` : "none",
        }}>
          <div style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: C.w, letterSpacing: "-.02em", lineHeight: 1 }}>
            {s.val.includes("★")
              ? <>{s.val.replace("★","")}<span style={{ color: C.red }}>★</span></>
              : s.val.endsWith("%")
              ? <>{s.val.slice(0,-1)}<span style={{ color: C.red }}>%</span></>
              : s.val}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.gray, marginTop: 6 }}>
            {s.lbl}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────── Vehicles ─────────────────────────── */
function VehicleCard({ type }: { type: VehicleType }) {
  const v = VEHICLES[type]
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.s2 : C.s1,
        padding: "36px 32px", cursor: "pointer", position: "relative",
        overflow: "hidden", transition: "all .3s",
      }}
    >
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: v.accent,
        transform: `scaleX(${hov ? 1 : 0})`, transformOrigin: "left",
        transition: "transform .3s",
      }} />

      <div style={{
        width: 64, height: 64, borderRadius: 12, background: v.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, marginBottom: 24,
        transform: hov ? "scale(1.1)" : "scale(1)", transition: "transform .3s",
      }}>
        {v.emoji}
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.01em", marginBottom: 8 }}>{v.name}</div>
      <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.6, marginBottom: 24 }}>{v.desc}</div>

      <div style={{ display: "flex", gap: 16 }}>
        {[["км/ч", v.speed.toString()], ["км запас", v.range.toString()], ["единиц", v.units]].map(([lbl, val]) => (
          <div key={lbl} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", color: v.accent }}>{val}</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: C.gray }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VehiclesSection() {
  return (
    <div style={{ padding: "100px 32px", maxWidth: 1120, margin: "0 auto" }}>
      <SectionLabel>Флот</SectionLabel>
      <SectionTitle>
        Три типа транспорта.<br />
        <em style={{ fontStyle: "normal", color: C.gray }}>Один аккаунт.</em>
      </SectionTitle>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
        gap: 2, background: C.border, borderRadius: 12, overflow: "hidden",
      }}>
        {(Object.keys(VEHICLES) as VehicleType[]).map(t => <VehicleCard key={t} type={t} />)}
      </div>
    </div>
  )
}

/* ─────────────────────────── How it works ─────────────────────────── */
function HowSection() {
  return (
    <div style={{
      background: C.s1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: "100px 32px",
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <SectionLabel>Как это работает</SectionLabel>
        <SectionTitle>
          От регистрации<br />
          <em style={{ fontStyle: "normal", color: C.gray }}>до поездки — 60 секунд.</em>
        </SectionTitle>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 2, background: C.border, borderRadius: 8, overflow: "hidden",
        }}>
          {STEPS.map(step => (
            <div key={step.num} style={{ background: C.s1, padding: "36px 28px", position: "relative" }}>
              <div style={{
                position: "absolute", top: 16, right: 20,
                fontSize: 64, fontWeight: 900, letterSpacing: "-.04em",
                color: "rgba(255,255,255,.04)", lineHeight: 1, userSelect: "none",
              }}>{step.num}</div>
              <div style={{ fontSize: 28, marginBottom: 20 }}>{step.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Zones / Map ─────────────────────────── */
function ZonesSection() {
  return (
    <div style={{ padding: "100px 32px", maxWidth: 1120, margin: "0 auto" }}>
      <SectionLabel>Зоны присутствия</SectionLabel>
      <SectionTitle>
        Алматы — полностью<br />
        <em style={{ fontStyle: "normal", color: C.gray }}>охвачен нашей сетью.</em>
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        {/* Map */}
        <div style={{
          background: C.s1, border: `1px solid ${C.border}`, borderRadius: 12,
          overflow: "hidden", aspectRatio: "4/3", position: "relative",
        }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <rect width="480" height="360" fill="#111113"/>
            <g stroke="#1e2024" strokeWidth="1" fill="none">
              {[50,100,150,200,250,300].map(y => <line key={y} x1="0" y1={y} x2="480" y2={y} />)}
              {[60,120,180,240,300,360,420].map(x => <line key={x} x1={x} y1="0" x2={x} y2="360" />)}
            </g>
            <line x1="0" y1="140" x2="480" y2="140" stroke="#242830" strokeWidth="5"/>
            <line x1="0" y1="220" x2="480" y2="220" stroke="#242830" strokeWidth="5"/>
            <line x1="180" y1="0" x2="180" y2="360" stroke="#242830" strokeWidth="5"/>
            <line x1="340" y1="0" x2="340" y2="360" stroke="#242830" strokeWidth="5"/>
            <text x="20" y="133" fill="#1e2a3a" fontSize="8" fontFamily="monospace" letterSpacing="1">АЛЬ-ФАРАБИ</text>
            <text x="20" y="213" fill="#1e2a3a" fontSize="8" fontFamily="monospace" letterSpacing="1">АБАЯ</text>
            <rect x="70" y="150" width="50" height="35" fill="#131a18" rx="3"/>
            <rect x="350" y="150" width="45" height="32" fill="#131a18" rx="3"/>
            {/* Pins */}
            {[
              { cx: 140, cy: 140, color: C.red,   id: "TS-001" },
              { cx: 240, cy: 140, color: C.blue,  id: "EB-011" },
              { cx: 340, cy: 140, color: C.blue,  id: "TS-004" },
              { cx: 180, cy: 220, color: C.red,   id: "TS-007" },
              { cx: 300, cy: 220, color: C.green, id: "EB-003" },
              { cx: 420, cy: 200, color: C.blue,  id: "EB-009" },
              { cx:  90, cy: 260, color: C.amber, id: "TS-012" },
            ].map(pin => (
              <g key={pin.id}>
                <circle cx={pin.cx} cy={pin.cy} r={14} fill={`${pin.color}0d`} />
                <circle cx={pin.cx} cy={pin.cy} r={8}  fill={`${pin.color}20`} stroke={pin.color} strokeWidth="1.5" />
                <circle cx={pin.cx} cy={pin.cy} r={3}  fill={pin.color} />
                <text x={pin.cx + 12} y={pin.cy - 4} fill={pin.color} fontSize="8" fontFamily="monospace">{pin.id}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Zone list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.gray, marginBottom: 6 }}>
            Активные зоны
          </div>
          {ZONES.map(z => (
            <div key={z.name} style={{
              background: C.s1, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
              cursor: "pointer",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: z.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".02em", textTransform: "uppercase" }}>{z.name}</div>
                <div style={{ fontSize: 11, color: C.gray, marginTop: 2, fontFamily: "monospace" }}>{z.meta}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.02em", color: C.blue }}>{z.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Pricing ─────────────────────────── */
const PLANS = [
  {
    id: "start" as PlanType, name: "Старт", price: "30", unit: "₸/мин", featured: false,
    features: ["Самокаты и байки", "Парковка 15 мин бесплатно", "История поездок"],
    missing: ["Мопеды", "Приоритетная поддержка"],
    cta: "Начать бесплатно",
  },
  {
    id: "pro" as PlanType, name: "Про", price: "990", unit: "₸/мес", featured: true,
    badge: "Популярный",
    features: ["Весь флот · Без доп. платы", "60 мин в день включено", "Мопеды доступны", "Приоритет на станциях", "Поддержка 24/7"],
    missing: [],
    cta: "Попробовать 7 дней",
  },
  {
    id: "biz" as PlanType, name: "Бизнес", price: "По\u00a0запросу", unit: "", featured: false,
    features: ["Корпоративный кабинет", "Командные аккаунты", "API-интеграция", "Выделенный менеджер", "SLA 99.9% гарантия"],
    missing: [],
    cta: "Связаться с нами",
  },
]

function PricingSection() {
  return (
    <div style={{
      background: C.s1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: "100px 32px",
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <SectionLabel>Тарифы</SectionLabel>
        <SectionTitle>
          Честные цены.<br />
          <em style={{ fontStyle: "normal", color: C.gray }}>Никакой подписки.</em>
        </SectionTitle>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 2, background: C.border, borderRadius: 12, overflow: "hidden",
        }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ background: plan.featured ? C.s2 : C.s1, padding: "36px 32px", position: "relative" }}>
              {plan.badge && (
                <div style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 100,
                  background: "rgba(232,0,43,.12)", border: "1px solid rgba(232,0,43,.3)",
                  fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
                  color: C.red, textTransform: "uppercase", marginBottom: 24,
                }}>{plan.badge}</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: C.gray, marginBottom: 10 }}>
                {plan.name}
              </div>
              <div style={{ fontSize: "clamp(32px,5vw,44px)", fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1 }}>
                {plan.price}
                {plan.unit && <span style={{ fontSize: ".3em", verticalAlign: "baseline", color: C.gray, fontWeight: 400 }}> {plan.unit}</span>}
              </div>
              <div style={{ width: "100%", height: 1, background: C.border, margin: "24px 0" }} />
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.gray }}>
                    <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
                {plan.missing?.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.gray, opacity: .4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>✗</span>{f}
                  </li>
                ))}
              </ul>
              <button style={{
                width: "100%", padding: 13, borderRadius: 6,
                border: `1px solid ${plan.featured ? C.red : C.border2}`,
                background: plan.featured ? C.red : "transparent",
                color: C.w, fontSize: 12, fontWeight: 700, letterSpacing: ".1em",
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
                transition: "all .2s",
              }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Reviews ─────────────────────────── */
function ReviewsSection() {
  return (
    <div style={{ padding: "100px 32px", maxWidth: 1120, margin: "0 auto" }}>
      <SectionLabel>Отзывы</SectionLabel>
      <SectionTitle>
        Что говорят<br />
        <em style={{ fontStyle: "normal", color: C.gray }}>те, кто уже едет.</em>
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {REVIEWS.map(r => (
          <div key={r.name} style={{
            background: C.s1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28,
          }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
              {Array.from({length:5}).map((_,i) => (
                <div key={i} style={{
                  width: 12, height: 12, background: C.amber,
                  clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
                }} />
              ))}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(244,244,245,.75)", marginBottom: 20, fontStyle: "italic" }}>
              "{r.text}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${r.color}20`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13, fontWeight: 700, color: r.color, flexShrink: 0,
              }}>{r.initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{r.meta}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────── Final CTA ─────────────────────────── */
function FinalCTA() {
  return (
    <div style={{
      background: C.s1, borderTop: `1px solid ${C.border}`,
      padding: "120px 32px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 600, height: 400, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse,rgba(232,0,43,.08) 0%,transparent 70%)",
      }} />
      <div style={{ position: "relative" }}>
        <h2 style={{
          fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 900,
          letterSpacing: "-.04em", lineHeight: 1.05, marginBottom: 20, color: C.w,
        }}>
          Алматы<br /><span style={{ color: C.red }}>не ждёт.</span>
        </h2>
        <p style={{ fontSize: 15, color: C.gray, maxWidth: 420, margin: "0 auto 48px", lineHeight: 1.6 }}>
          Присоединись к 45,000 райдеров. Первая поездка — бесплатно.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <BtnRed href="/auth">Зарегистрироваться</BtnRed>
          <BtnGhost href="/dashboard">Я оператор</BtnGhost>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Footer ─────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background: C.bg, borderTop: `1px solid ${C.border}`,
      padding: "48px 32px", textAlign: "center",
    }}>
      <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: ".04em", marginBottom: 20 }}>
        RIDE<span style={{ color: C.red }}>HUB</span>
      </div>
      <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
        {["О нас","Безопасность","Условия","Конфиденциальность","Пресса","Вакансии","Контакты"].map(l => (
          <a key={l} href="#" style={{ fontSize: 12, color: C.gray, letterSpacing: ".05em", textDecoration: "none" }}>{l}</a>
        ))}
      </div>
      <div style={{ fontSize: 11, color: C.gray2, letterSpacing: ".05em" }}>
        © 2025 RideHub · Алматы, Казахстан · Разработано Сериком Досжановым
      </div>
      <div style={{
        marginTop: 32, fontSize: "clamp(14px,2vw,20px)", fontWeight: 800,
        letterSpacing: ".22em", textTransform: "uppercase",
        color: "rgba(255,255,255,.1)", wordSpacing: ".5em",
      }}>
        RIDEHUB. <span style={{ color: "rgba(0,207,255,.28)" }}>БАҚЫЛАУ</span>. ЖЫЛДАМДЫҚ. БОСТАНДЫҚ.
      </div>
    </footer>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ background: C.bg, color: C.w, overflowX: "hidden", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <VehiclesSection />
      <HowSection />
      <ZonesSection />
      <PricingSection />
      <ReviewsSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}