"use client"
import { useState } from "react"
import Link from "next/link"

const C = {
  bg: "#08090a", s1: "#111113", s2: "#18181b",
  border: "#1a1a1e", border2: "#2a2a2e",
  red: "#e8002b", blue: "#00cfff", green: "#00e676",
  w: "#f4f4f5", gray: "#71717a", gray2: "#52525b",
}

export default function ContactsPage() {
  const [form, setForm]       = useState({ name: "", email: "", subject: "general", message: "" })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))   // replace with real API call
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ background: C.bg, color: C.w, minHeight: "100vh", fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* ── HEADER ── */}
      <section style={{ padding: "80px 40px 60px", textAlign: "center", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: C.red, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ width: 28, height: 1, background: C.red }} />Контакты<span style={{ width: 28, height: 1, background: C.red }} />
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.05, marginBottom: 16 }}>
            Напишите нам.<br /><span style={{ color: C.red }}>Ответим быстро.</span>
          </h1>
          <p style={{ fontSize: 15, color: C.gray, maxWidth: 420, margin: "0 auto" }}>
            Вопрос, партнёрство, пресса или просто хочешь поговорить о городской мобильности — мы здесь.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "60px 32px 80px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "start" }}>

        {/* ── FORM ── */}
        {!sent ? (
          <div style={{ background: C.s1, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "36px 32px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: C.gray2, marginBottom: 28 }}>
              Форма обратной связи
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Name + Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Имя" type="text" placeholder="Серик Досжанов"
                  value={form.name} onChange={v => update("name", v)} />
                <InputField label="Email" type="email" placeholder="you@company.kz"
                  value={form.email} onChange={v => update("email", v)} />
              </div>

              {/* Subject */}
              <div>
                <label style={labelStyle}>Тема обращения</label>
                <select value={form.subject} onChange={e => update("subject", e.target.value)}
                  style={{ width: "100%", background: C.s2, border: `1px solid ${C.border2}`, borderRadius: 4, color: C.w, fontFamily: "monospace", fontSize: 13, padding: "11px 14px", outline: "none" }}>
                  <option value="general">Общий вопрос</option>
                  <option value="partner">Партнёрство / B2B</option>
                  <option value="press">Пресса / СМИ</option>
                  <option value="operator">Стать оператором</option>
                  <option value="tech">Технические вопросы</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label style={labelStyle}>Сообщение</label>
                <textarea
                  rows={5}
                  placeholder="Расскажите подробнее..."
                  value={form.message}
                  onChange={e => update("message", e.target.value)}
                  style={{ width: "100%", background: C.s2, border: `1px solid ${C.border2}`, borderRadius: 4, color: C.w, fontFamily: "monospace", fontSize: 13, padding: "11px 14px", outline: "none", resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              <button type="submit" disabled={loading} style={{
                padding: "13px 28px", background: loading ? "#cc0024" : C.red, border: "none", borderRadius: 6,
                fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                opacity: loading ? .7 : 1, transition: "all .18s",
                boxShadow: "0 4px 20px rgba(232,0,43,0.22)",
              }}>
                {loading ? "Отправляем..." : "Отправить сообщение →"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: C.s1, border: `1px solid rgba(0,230,118,.25)`, borderRadius: 10, padding: "60px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 12 }}>Сообщение отправлено!</h2>
            <p style={{ fontSize: 14, color: C.gray, marginBottom: 28, lineHeight: 1.6 }}>
              Мы получили ваше сообщение и ответим в течение 24 часов.
            </p>
            <button onClick={() => setSent(false)} style={{ padding: "11px 24px", background: "transparent", border: `1px solid ${C.border2}`, borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.w, cursor: "pointer", fontFamily: "inherit" }}>
              Написать ещё
            </button>
          </div>
        )}

        {/* ── INFO SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: "📍", title: "Офис", lines: ["Алматы, Казахстан", "пр. Аль-Фараби, 17", "БЦ Нурлы Тау, 4-й этаж"] },
            { icon: "📧", title: "Email", lines: ["hello@ridehub.kz", "press@ridehub.kz", "partners@ridehub.kz"] },
            { icon: "📞", title: "Телефон", lines: ["+7 (727) 300-42-00", "Пн–Пт 09:00–20:00"] },
            { icon: "💬", title: "Соцсети", lines: ["@ridehub_almaty", "Telegram · Instagram · LinkedIn"] },
          ].map(item => (
            <div key={item.title} style={{ background: C.s1, border: `1px solid ${C.border2}`, borderRadius: 8, padding: "20px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.gray2 }}>{item.title}</span>
              </div>
              {item.lines.map(l => (
                <div key={l} style={{ fontSize: 13, color: C.gray, lineHeight: 1.7, fontFamily: "monospace" }}>{l}</div>
              ))}
            </div>
          ))}

          {/* Map thumbnail */}
          <div style={{ background: C.s1, border: `1px solid ${C.border2}`, borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.red, boxShadow: `0 0 14px ${C.red}` }} />
              <span style={{ fontSize: 11, fontFamily: "monospace", color: C.gray, letterSpacing: ".1em" }}>пр. Аль-Фараби, 17</span>
              <Link href="/map" style={{ fontSize: 11, color: C.blue, fontFamily: "monospace", textDecoration: "none", letterSpacing: ".08em", marginTop: 4 }}>
                Открыть карту →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SLOGAN */}
      <footer style={{ background: C.s1, borderTop: `1px solid ${C.border}`, padding: "32px", textAlign: "center" }}>
        <div style={{ fontSize: "clamp(11px,1.5vw,16px)", fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.07)", wordSpacing: ".5em" }}>
          RIDEHUB. <span style={{ color: "rgba(0,207,255,.22)" }}>БАҚЫЛАУ</span>. ЖЫЛДАМДЫҚ. БОСТАНДЫҚ.
        </div>
      </footer>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
  color: "#7a8088", fontWeight: 700, marginBottom: 8,
}

function InputField({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string; value: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: focused ? "#1c1f21" : "#18181b",
          border: `1px solid ${focused ? "#00b4ff" : "#2a2a2e"}`,
          borderRadius: 4, color: "#f0f2f4", fontFamily: "monospace",
          fontSize: 13, padding: "11px 14px", outline: "none",
          boxShadow: focused ? "0 0 0 2px rgba(0,180,255,0.18)" : "none",
          transition: "all .18s",
        }}
      />
    </div>
  )
}
