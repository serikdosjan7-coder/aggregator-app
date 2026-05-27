"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Данные ──────────────────────────────────────────────────────────────────

const STATS = [
  { value: "1 240+", label: "самокатов и велосипедов", suffix: "" },
  { value: "18",     label: "районов Алматы",          suffix: "" },
  { value: "47k",    label: "активных пользователей",  suffix: "+" },
  { value: "4.9",    label: "рейтинг в App Store",     suffix: "★" },
];

const TEAM = [
  {
    name:   "Серик Досжан",
    role:   "Founder & CEO",
    emoji:  "👨‍💼",
    bio:    "Строит RideHub с нуля. Верит, что Алматы станет городом без пробок.",
    color:  "#0a0a0a",
  },
  {
    name:   "Куралай Молдатия",
    role:   "Head of Design",
    emoji:  "🎨",
    bio:    "Отвечает за каждый пиксель. Любит минимализм и горы.",
    color:  "#1a1a2e",
  },
  {
    name:   "Данияр Мухитов",
    role:   "Lead Engineer",
    emoji:  "⚙️",
    bio:    "Пишет код быстрее, чем самокат разгоняется до 25 км/ч.",
    color:  "#0f2027",
  },
  {
    name:   "Мухатров Медет",
    role:   "Growth & Marketing",
    emoji:  "📈",
    bio:    "Превращает алматинцев в фанатов микромобильности.",
    color:  "#1a0a2e",
  },
];

const VALUES = [
  { icon: "⚡", title: "Скорость",     desc: "Найди и арендуй транспорт за 30 секунд. Никаких очередей." },
  { icon: "🌿", title: "Экология",     desc: "Каждая поездка — минус один автомобиль на дороге." },
  { icon: "🔒", title: "Безопасность", desc: "Все самокаты проходят ежедневную техническую проверку." },
  { icon: "💡", title: "Инновации",    desc: "Первый AI-агрегатор микромобильности в Казахстане." },
  { icon: "🤝", title: "Доступность",  desc: "Студенческие скидки 50%. Первая поездка — бесплатно." },
  { icon: "📍", title: "Алматы ❤️",    desc: "Создано алматинцами для алматинцев. Мы знаем каждый маршрут." },
];

// ─── Компонент анимированного счётчика ────────────────────────────────────────
function AnimatedCounter({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const num = parseFloat(value.replace(/[^0-9.]/g, ""));
        const isFloat = value.includes(".");
        let start = 0;
        const duration = 1400;
        const step = (timestamp: number, startTime: number) => {
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * num;
          setDisplayed(isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString("ru"));
          if (progress < 1) requestAnimationFrame((ts) => step(ts, startTime));
          else setDisplayed(value.replace(/[0-9.,]+/, isFloat ? num.toFixed(1) : num.toLocaleString("ru")));
        };
        requestAnimationFrame((ts) => step(ts, ts));
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{displayed}</span>;
}

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", overflowX: "hidden" }}>

      {/* Video background — как в /auth */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <source src="/city-night.mp4" type="video/mp4" />
      </video>

      {/* ── ГЛОБАЛЬНЫЕ СТИЛИ ─────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;700;900&display=swap');

        * { box-sizing: border-box; }

        .about-wrap { font-family: 'Onest', 'Helvetica Neue', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: .35; }
          50%       { opacity: .65; }
        }
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(40px,-30px) scale(1.12); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-35px,25px) scale(0.9); }
        }
        @keyframes lineSlide {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .fade-in { animation: fadeUp .7s ease forwards; }

        .hero-title { font-size: clamp(44px, 8vw, 96px); font-weight: 900; line-height: 1.0; letter-spacing: -3px; }
        .hero-title .accent { color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,.35); }

        .stat-card:hover { background: rgba(255,255,255,.07) !important; transform: translateY(-4px); }
        .stat-card { transition: all .25s ease; }

        .team-card:hover .team-avatar { transform: scale(1.1) rotate(-4deg); }
        .team-card:hover { border-color: rgba(255,255,255,.18) !important; }
        .team-card { transition: border-color .25s; }
        .team-avatar { transition: transform .3s cubic-bezier(.34,1.56,.64,1); }

        .value-card:hover { background: rgba(255,255,255,.06) !important; border-color: rgba(255,255,255,.15) !important; }
        .value-card { transition: all .2s ease; }

        .cta-btn:hover { background: #fff !important; color: #080810 !important; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,255,255,.15); }
        .cta-btn { transition: all .25s ease; }

        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.35); }

        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 768px) {
          .grid-3 { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
          .hero-title { letter-spacing: -2px; }
          .stats-row { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="about-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* ══════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════ */}
        <section style={{ position: "relative", paddingTop: "clamp(80px, 12vw, 140px)", paddingBottom: 80, overflow: "hidden" }}>

          {/* фоновые орбы */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 700, pointerEvents: "none", zIndex: 0 }}>
            <div style={{ position: "absolute", width: 420, height: 420, top: -60, left: -80, background: "radial-gradient(circle, rgba(99,102,241,.25) 0%, transparent 70%)", animation: "orb1 8s ease-in-out infinite", borderRadius: "50%" }} />
            <div style={{ position: "absolute", width: 320, height: 320, top: 80, right: -40, background: "radial-gradient(circle, rgba(16,185,129,.15) 0%, transparent 70%)", animation: "orb2 10s ease-in-out infinite", borderRadius: "50%" }} />
          </div>

          {/* теговая метка */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: 28, opacity: mounted ? 1 : 0, transition: "opacity .5s" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 40, padding: "6px 16px", fontSize: 13, color: "rgba(255,255,255,.7)" }}>
              <span style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%", display: "inline-block" }} />
              Алматы, Казахстан · Основана в 2026
            </span>
          </div>

          {/* заголовок */}
          <h1 className="hero-title fade-in" style={{ position: "relative", zIndex: 1, marginBottom: 32 }}>
            Мы меняем<br />
            <span className="accent">то, как</span><br />
            Алматы едет
          </h1>

          {/* подзаголовок */}
          <p className="fade-in" style={{ animationDelay: ".15s", animationFillMode: "both", opacity: 0, position: "relative", zIndex: 1, fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,.55)", maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}>
            RideHub — первый в Казахстане интеллектуальный агрегатор микромобильного транспорта. Один экран. Все самокаты и велосипеды города.
          </p>

          {/* CTA кнопки */}
          <div className="fade-in" style={{ animationDelay: ".3s", animationFillMode: "both", opacity: 0, display: "flex", gap: 12, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <Link href="/map" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 50, padding: "13px 28px", fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
              Открыть карту →
            </Link>
            <Link href="/contacts" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid rgba(255,255,255,.15)", borderRadius: 50, padding: "13px 28px", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,.65)", textDecoration: "none" }}>
              Написать нам
            </Link>
          </div>

          {/* горизонтальная линия под hero */}
          <div style={{ position: "relative", zIndex: 1, marginTop: 80, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.12) 30%, rgba(255,255,255,.12) 70%, transparent)", transformOrigin: "left", animation: "lineSlide 1s .6s ease forwards", transform: "scaleX(0)" }} />
        </section>

        {/* ══════════════════════════════════════════════════
            СТАТИСТИКА
        ══════════════════════════════════════════════════ */}
        <section style={{ paddingTop: 64, paddingBottom: 80 }}>
          <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {STATS.map((s, i) => (
              <div
                key={i}
                className="stat-card fade-in"
                style={{ animationDelay: `${i * .1}s`, animationFillMode: "both", opacity: 0, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "28px 24px" }}
              >
                <div style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, letterSpacing: -1, color: "#fff", lineHeight: 1 }}>
                  <AnimatedCounter value={s.value} />{s.suffix}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 8, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            МИССИЯ + КАРТА/ИЛЛЮСТРАЦИЯ
        ══════════════════════════════════════════════════ */}
        <section style={{ paddingBottom: 100 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }} className="mission-grid">

            {/* текст */}
            <div>
              <p className="section-label" style={{ marginBottom: 20 }}>Наша миссия</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.15, marginBottom: 24 }}>
                Сделать каждый<br />маршрут удобным
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", lineHeight: 1.8, marginBottom: 24 }}>
                Алматы — растущий мегаполис. Пробки, парковки, загазованность. Мы верим, что будущее города — за умным микротранспортом. RideHub агрегирует все доступные самокаты и велосипеды на одной карте, чтобы вы тратили время на жизнь, а не на ожидание.
              </p>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", lineHeight: 1.8 }}>
                Мы не просто приложение — мы инфраструктура нового Алматы.
              </p>
            </div>

            {/* визуальный блок — мини-карта города */}
            <div style={{ position: "relative", height: 380, borderRadius: 24, overflow: "hidden", background: "linear-gradient(135deg, rgba(13,27,42,0.6) 0%, rgba(26,39,68,0.6) 50%, rgba(13,27,42,0.6) 100%)", border: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(4px)" }}>
              {/* карта-сетка улиц */}
              <svg width="100%" height="100%" viewBox="0 0 500 380" style={{ position: "absolute", inset: 0, opacity: 0.45 }}>
                {/* горизонтальные улицы */}
                {[60, 110, 160, 210, 260, 310, 340].map((y, i) => (
                  <line key={i} x1="0" y1={y} x2="500" y2={y} stroke={i === 2 ? "#6366f1" : "rgba(255,255,255,.3)"} strokeWidth={i === 2 ? 3 : 1} />
                ))}
                {/* вертикальные улицы */}
                {[70, 150, 230, 310, 390, 460].map((x, i) => (
                  <line key={i} x1={x} y1="0" x2={x} y2="380" stroke={i === 2 ? "#10b981" : "rgba(255,255,255,.3)"} strokeWidth={i === 2 ? 3 : 1} />
                ))}
                {/* блоки зданий */}
                {[[80,68,60,32],[160,68,60,32],[240,68,60,32],[80,118,150,32],[80,168,60,32],[160,168,120,32],[320,68,130,32],[320,118,130,72],[80,218,210,32],[320,218,130,32]].map(([x,y,w,h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="rgba(99,102,241,.15)" stroke="rgba(99,102,241,.2)" strokeWidth="0.5" />
                ))}
              </svg>

              {/* маркеры транспорта */}
              {[
                { x: "30%", y: "40%", type: "🛴", label: "×3", color: "#6366f1" },
                { x: "55%", y: "25%", type: "⚡", label: "×1", color: "#10b981" },
                { x: "65%", y: "60%", type: "🚲", label: "×2", color: "#f59e0b" },
                { x: "20%", y: "65%", type: "🛴", label: "×1", color: "#6366f1" },
                { x: "75%", y: "35%", type: "🛴", label: "×2", color: "#6366f1" },
              ].map((m, i) => (
                <div key={i} style={{ position: "absolute", left: m.x, top: m.y, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ background: m.color, borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, border: "2px solid rgba(255,255,255,.3)", boxShadow: `0 0 12px ${m.color}80` }}>
                    {m.type}
                  </div>
                  <div style={{ background: "rgba(0,0,0,.6)", borderRadius: 8, padding: "2px 6px", fontSize: 10, color: "#fff", fontWeight: 700 }}>{m.label}</div>
                </div>
              ))}

              {/* надпись на карте */}
              <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(255,255,255,.1)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 2 }}>Алматы, сейчас</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>124 свободных самоката</div>
              </div>

              {/* пульсирующая точка */}
              <div style={{ position: "absolute", top: 20, right: 20, display: "flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 20, padding: "5px 10px" }}>
                <div style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%", animation: "glowPulse 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Live</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            ЦЕННОСТИ
        ══════════════════════════════════════════════════ */}
        <section style={{ paddingBottom: 100 }}>
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Принципы</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: -1 }}>Что нас отличает</h2>
          </div>
          <div className="grid-3">
            {VALUES.map((v, i) => (
              <div key={i} className="value-card fade-in" style={{ animationDelay: `${i * .08}s`, animationFillMode: "both", opacity: 0, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "28px 24px", backdropFilter: "blur(4px)" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{v.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.45)", lineHeight: 1.7 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            КОМАНДА
        ══════════════════════════════════════════════════ */}
        <section style={{ paddingBottom: 100 }}>
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Люди</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: -1 }}>Команда RideHub</h2>
          </div>
          <div className="grid-2">
            {TEAM.map((m, i) => (
              <div key={i} className="team-card" style={{ background: `linear-gradient(135deg, ${m.color}cc 0%, rgba(255,255,255,.02) 100%)`, border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: "32px 28px", display: "flex", gap: 20, alignItems: "flex-start", backdropFilter: "blur(4px)" }}>
                <div className="team-avatar" style={{ width: 60, height: 60, background: "rgba(255,255,255,.07)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: "1px solid rgba(255,255,255,.1)" }}>
                  {m.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{m.role}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}>{m.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            ВРЕМЕННАЯ ЛИНИЯ
        ══════════════════════════════════════════════════ */}
        <section style={{ paddingBottom: 100 }}>
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <p className="section-label" style={{ marginBottom: 12 }}>История</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: -1 }}>Как мы росли</h2>
          </div>
          <div style={{ position: "relative", paddingLeft: 40 }}>
            <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 2, background: "linear-gradient(to bottom, #6366f1, #10b981, rgba(255,255,255,.1))", borderRadius: 2 }} />
            {[
              { year: "2023 Q1", event: "Идея", desc: "Берик застрял в пробке и решил написать приложение." },
              { year: "2023 Q3", event: "MVP",  desc: "Первые 50 самокатов на карте. 200 пользователей за неделю." },
              { year: "2024 Q1", event: "Раунд A", desc: "Привлечено $800k инвестиций. Команда выросла до 12 человек." },
              { year: "2024 Q4", event: "1 000+ единиц", desc: "Покрытие всех 18 районов Алматы. 40 000 поездок." },
              { year: "2026",    event: "RideHub 2.0", desc: "AI-рекомендации маршрутов и предиктивная аналитика." },
            ].map((t, i) => (
              <div key={i} style={{ position: "relative", paddingBottom: 32, display: "flex", gap: 20 }}>
                <div style={{ position: "absolute", left: -47, width: 16, height: 16, background: i === 4 ? "#10b981" : "#6366f1", borderRadius: "50%", border: "3px solid #080810", boxShadow: `0 0 8px ${i === 4 ? "#10b981" : "#6366f1"}` }} />
                <div style={{ flex: 1, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: "18px 22px", backdropFilter: "blur(2px)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: 2, textTransform: "uppercase" }}>{t.year}</span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{t.event}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.45)", lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════ */}
        <section style={{ paddingBottom: 100 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,.12) 0%, rgba(16,185,129,.08) 100%)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 32, padding: "clamp(40px, 6vw, 72px) clamp(28px, 5vw, 64px)", textAlign: "center", position: "relative", overflow: "hidden", backdropFilter: "blur(4px)" }}>

            {/* декоративный фон */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(99,102,241,.1) 0%, transparent 70%)", pointerEvents: "none" }} />

            <p className="section-label" style={{ marginBottom: 16, position: "relative" }}>Присоединяйся</p>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.1, marginBottom: 20, position: "relative" }}>
              Поехали вместе?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7, position: "relative" }}>
              Первая поездка бесплатно. Зарегистрируйся за 30 секунд — и вперёд по Алматы.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link href="/auth" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 700, color: "#080810", textDecoration: "none", border: "none" }}>
                Начать бесплатно →
              </Link>
              <Link href="/contacts" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,.75)", textDecoration: "none" }}>
                Написать нам
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 32, paddingBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>RideHub <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 400 }}>Almaty</span></div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>© 2026 · Сделано с ❤️ в Алматы</div>
        </footer>

      </div>
    </div>
  );
}