"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

/* ═══════════════════════════════════════════════════════════════════
   RideHub — Landing Page v5
   ✅ Video BG fixed (next/video tag + canvas fallback)
   ✅ Smooth scroll navbar with active highlight
   ✅ SVG vehicle illustrations
   ✅ Full sections: Fleet · How · Zones · Pricing · Reviews · CTA
═══════════════════════════════════════════════════════════════════ */

const C = {
  bg:      "#08090a",
  s1:      "#0f0f11",
  s2:      "#141416",
  s3:      "#1a1a1d",
  border:  "#1e1e22",
  border2: "#2a2a2e",
  border3: "#38383e",
  red:     "#e8002b",
  red2:    "#ff1a3d",
  reddim:  "rgba(232,0,43,0.10)",
  blue:    "#00cfff",
  bluedim: "rgba(0,207,255,0.09)",
  green:   "#00e676",
  amber:   "#ffab00",
  w:       "#f4f4f5",
  gray:    "#71717a",
  gray2:   "#52525b",
  gray3:   "#3a3a3e",
}

/* ─────────── Smooth scroll ─────────── */
function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.pageYOffset - 64
  window.scrollTo({ top: y, behavior: "smooth" })
}

/* ─────────── Active section ─────────── */
const SECTION_IDS = ["home", "fleet", "how", "zones", "pricing", "reviews"]

function useActive() {
  const [active, setActive] = useState("home")
  useEffect(() => {
    const fn = () => {
      let cur = "home"
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 80) cur = id
      }
      setActive(cur)
    }
    window.addEventListener("scroll", fn, { passive: true })
    fn()
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return active
}

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
const NAV = [
  { label: "Транспорт",    id: "fleet"   },
  { label: "Как работает", id: "how"     },
  { label: "Карта",        id: "zones"   },
  { label: "Тарифы",       id: "pricing" },
  { label: "Отзывы",       id: "reviews" },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const active = useActive()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", fn, { passive: true })
    fn()
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 300,
        height: 64,
        background: scrolled ? "rgba(8,9,10,0.97)" : "rgba(8,9,10,0.75)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${scrolled ? C.border2 : "rgba(255,255,255,0.04)"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 36px",
        transition: "all .3s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Logo */}
        <button onClick={() => scrollTo("home")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 17, fontWeight: 900, letterSpacing: ".06em",
          color: C.w, fontFamily: "inherit", padding: 0,
        }}>
          RIDE<span style={{ color: C.red }}>HUB</span>
        </button>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 2 }}>
          {NAV.map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              border: "none", cursor: "pointer",
              padding: "7px 16px", borderRadius: 5,
              fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
              textTransform: "uppercase", fontFamily: "inherit",
              color: active === id ? C.red : C.gray,
              background: active === id ? C.reddim : "transparent",
              transition: "all .18s",
            }}>{label}</button>
          ))}
        </div>

        {/* CTA */}
        <Link href="/auth" style={{
          padding: "8px 22px",
          background: C.red, borderRadius: 5,
          fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
          textTransform: "uppercase", color: "#fff",
          textDecoration: "none", transition: "background .18s",
          whiteSpace: "nowrap",
        }}>
          Войти →
        </Link>
      </nav>
    </>
  )
}

/* ══════════════════════════════════════
/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
function Hero() {
  return (
    <section id="home" style={{
      position: "relative", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 32px 120px", textAlign: "center",
      overflow: "hidden",
      background: "transparent",
    }}>

      {/* Canvas animated particles */}
      <CanvasBG />

      {/* Красный радиальный акцент */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 75% 58% at 50% 38%, rgba(232,0,43,.08) 0%, transparent 65%)",
      }} />

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 820 }}>

        {/* Pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(232,0,43,.08)", border: "1px solid rgba(232,0,43,.2)",
          borderRadius: 100, padding: "6px 18px", marginBottom: 32,
          fontSize: 11, fontWeight: 700, letterSpacing: ".14em",
          textTransform: "uppercase", color: C.red,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, animation: "rh-blink 2s infinite" }} />
          Алматы · 2025 · 24 / 7
        </div>

        <h1 style={{
          fontSize: "clamp(2.8rem,7vw,6.5rem)", fontWeight: 900,
          letterSpacing: "-.04em", lineHeight: .96,
          color: C.w, marginBottom: 24,
        }}>
          Весь город —<br />
          <span style={{ color: C.red }}>твой маршрут.</span>
        </h1>

        <p style={{
          fontSize: "clamp(.95rem,1.8vw,1.18rem)", fontWeight: 300,
          color: "#9ca3af", maxWidth: 460, margin: "0 auto 20px", lineHeight: 1.65,
        }}>
          Самокаты, велосипеды, мопеды. Один QR — поехал.
          Без очередей, без пробок, без лишнего.
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          {["⚡ Самокаты", "🚲 E-Байки", "🛵 Мопеды", "📍 GPS", "🔋 Зарядка"].map(t => (
            <span key={t} style={{
              padding: "5px 14px", borderRadius: 100,
              border: "1px solid rgba(255,255,255,.1)",
              fontSize: 12, color: "#9ca3af", letterSpacing: ".03em",
              background: "rgba(255,255,255,.03)",
            }}>{t}</span>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth" style={btnRedStyle}>
            Начать поездку →
          </Link>
          <Link href="/map" style={btnGhostStyle}>
            Открыть карту
          </Link>
        </div>
      </div>

      {/* Scroll line */}
      <div style={{
        position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2,
      }}>
        <div style={{ width: 1, height: 44, background: `linear-gradient(${C.red}, transparent)` }} />
        <span style={{ fontSize: 9, letterSpacing: ".25em", color: C.gray3, textTransform: "uppercase" }}>прокрутить</span>
      </div>

      <style>{`
        @keyframes rh-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes rh-spin  { to{transform:rotate(360deg)} }
      `}</style>
    </section>
  )
}

/* ── Canvas animated background ── */
function CanvasBG() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext("2d")!
    let raf: number, t = 0

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const W = () => canvas.width
    const H = () => canvas.height

    // Particles
    type P = { x:number;y:number;r:number;vx:number;vy:number;a:number;col:string;ph:number;ps:number }
    const particles: P[] = Array.from({length:80}, () => ({
      x: Math.random()*2000, y: Math.random()*900,
      r: .4+Math.random()*1.8, vx: -.12+Math.random()*.24, vy: -.22+Math.random()*.15,
      a: .12+Math.random()*.5,
      col: Math.random()<.14?"#e8002b":Math.random()<.18?"#00cfff":"#ffffff",
      ph: Math.random()*Math.PI*2, ps: .01+Math.random()*.025,
    }))

    // Speed lines
    type L = { x:number;y:number;len:number;spd:number;a:number;col:string;w:number }
    const lines: L[] = Array.from({length:16}, () => ({
      x: Math.random()*2000, y: 200+Math.random()*500,
      len: 50+Math.random()*110, spd: 1.4+Math.random()*3.2,
      a: .04+Math.random()*.13, col: Math.random()<.18?"#e8002b":Math.random()<.2?"#00cfff":"#333",
      w: .5+Math.random()*.9,
    }))

    const NODES = [{x:.1,y:.22},{x:.88,y:.17},{x:.05,y:.68},{x:.93,y:.74},{x:.22,y:.85},{x:.8,y:.88}]

    function frame() {
      t++
      ctx.clearRect(0,0,W(),H())
      // НЕ заливаем фон — видео просвечивает сквозь canvas

      // grid
      ctx.save(); ctx.strokeStyle="rgba(255,255,255,.022)"; ctx.lineWidth=.5
      const sz=64
      for(let x=0;x<W();x+=sz){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H());ctx.stroke()}
      for(let y=0;y<H();y+=sz){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W(),y);ctx.stroke()}
      ctx.restore()

      // red glow
      const g=ctx.createRadialGradient(W()*.5,H()*.38,0,W()*.5,H()*.38,Math.max(W(),H())*.5)
      g.addColorStop(0,"rgba(232,0,43,.065)"); g.addColorStop(1,"rgba(232,0,43,0)")
      ctx.fillStyle=g; ctx.fillRect(0,0,W(),H())

      // speed lines
      lines.forEach(l=>{
        l.x-=l.spd; if(l.x+l.len<0) l.x=W()+Math.random()*200
        ctx.save(); ctx.globalAlpha=l.a; ctx.strokeStyle=l.col; ctx.lineWidth=l.w
        ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+l.len,l.y); ctx.stroke()
        ctx.restore()
      })

      // particles
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.ph+=p.ps
        if(p.y<-5) p.y=H()+5
        if(p.x<-5) p.x=W()+5; if(p.x>W()+5) p.x=-5
        ctx.save(); ctx.globalAlpha=p.a*(0.6+0.4*Math.sin(p.ph))
        ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill()
        ctx.restore()
      })

      // scanline
      const sy=H()*.55+Math.sin(t*.007)*H()*.12
      const sg=ctx.createLinearGradient(0,sy-70,0,sy+70)
      sg.addColorStop(0,"rgba(232,0,43,0)"); sg.addColorStop(.5,"rgba(232,0,43,.018)"); sg.addColorStop(1,"rgba(232,0,43,0)")
      ctx.fillStyle=sg; ctx.fillRect(0,sy-70,W(),140)

      // circuit nodes
      NODES.forEach((n,i)=>{
        const nx=n.x*W(), ny=n.y*H(), pulse=Math.sin(t*.02+i*1.1)*.5+.5
        ctx.save(); ctx.globalAlpha=.06+pulse*.07; ctx.strokeStyle="#e8002b"; ctx.lineWidth=1
        ctx.beginPath(); ctx.arc(nx,ny,8+pulse*4,0,Math.PI*2); ctx.stroke()
        ctx.beginPath(); ctx.arc(nx,ny,2.5,0,Math.PI*2); ctx.fillStyle="#e8002b"; ctx.fill()
        if(i<NODES.length-1){
          const n2=NODES[i+1]
          ctx.beginPath(); ctx.moveTo(nx,ny); ctx.lineTo(n2.x*W(),n2.y*H())
          ctx.globalAlpha=.03; ctx.stroke()
        }
        ctx.restore()
      })

      raf=requestAnimationFrame(frame)
    }
    frame()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas ref={ref} style={{
      position:"absolute",inset:0,width:"100%",height:"100%",
      pointerEvents:"none",zIndex:0,display:"block",
    }} />
  )
}

/* ══════════════════════════════════════
   STATS BAR
══════════════════════════════════════ */
const STATS = [
  { v:"2,400+", l:"ТС в сети"       },
  { v:"7",      l:"Районов Алматы"  },
  { v:"180k",   l:"Поездок/месяц"   },
  { v:"99.8%",  l:"Uptime"          },
  { v:"4.9★",   l:"App Store"       },
]

function StatsBar() {
  return (
    <div style={{
      background: "rgba(8,9,10,0.82)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderTop:`1px solid ${C.border}`,
      borderBottom:`1px solid ${C.border}`,
      display:"flex", justifyContent:"center", flexWrap:"wrap",
    }}>
      {STATS.map((s,i)=>(
        <div key={s.l} style={{
          flex:1, minWidth:100, maxWidth:190, textAlign:"center",
          padding:"20px 8px",
          borderRight: i<STATS.length-1 ? `1px solid ${C.border}` : "none",
        }}>
          <div style={{fontSize:"clamp(22px,3.5vw,34px)",fontWeight:900,color:C.w,letterSpacing:"-.02em",lineHeight:1}}>
            {s.v.includes("★") ? <>{s.v.replace("★","")}<span style={{color:C.red}}>★</span></> : s.v}
          </div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:C.gray2,marginTop:6}}>
            {s.l}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   VEHICLE SVG ILLUSTRATIONS
══════════════════════════════════════ */
function ScooterSVG({ accent }: { accent: string }) {
  return (
    <svg width="200" height="110" viewBox="0 0 200 110" fill="none" style={{display:"block",margin:"0 auto"}}>
      {/* rear wheel */}
      <circle cx="34" cy="84" r="20" stroke={accent} strokeWidth="2.5" fill="none"/>
      <circle cx="34" cy="84" r="11" stroke="#2a2a2a" strokeWidth="1.8" fill="none"/>
      <circle cx="34" cy="84" r="3" fill={accent}/>
      {[[-20,0],[0,-20],[20,0],[0,20],[14,14],[-14,14],[14,-14],[-14,-14]].map(([dx,dy],i)=>(
        <line key={i} x1={34+(dx*.4)} y1={84+(dy*.4)} x2={34+(dx*.85)} y2={84+(dy*.85)} stroke="#2d2d2d" strokeWidth="1.2"/>
      ))}
      {/* front wheel */}
      <circle cx="162" cy="84" r="20" stroke={accent} strokeWidth="2.5" fill="none"/>
      <circle cx="162" cy="84" r="11" stroke="#2a2a2a" strokeWidth="1.8" fill="none"/>
      <circle cx="162" cy="84" r="3" fill={accent}/>
      {[[-20,0],[0,-20],[20,0],[0,20],[14,14],[-14,14],[14,-14],[-14,-14]].map(([dx,dy],i)=>(
        <line key={i} x1={162+(dx*.4)} y1={84+(dy*.4)} x2={162+(dx*.85)} y2={84+(dy*.85)} stroke="#2d2d2d" strokeWidth="1.2"/>
      ))}
      {/* deck */}
      <rect x="38" y="70" width="102" height="11" rx="3" fill="#1a1a1e" stroke="#282828" strokeWidth="1"/>
      {/* neck */}
      <path d="M138 70 L148 36 L155 36" stroke="#3a3a3a" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* handlebar */}
      <line x1="145" y1="36" x2="168" y2="36" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
      <circle cx="145" cy="36" r="3.5" fill={accent}/>
      <circle cx="168" cy="36" r="3.5" fill={accent}/>
      {/* fork */}
      <path d="M153 36 L162 64" stroke="#3a3a3a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      {/* battery */}
      <rect x="60" y="61" width="38" height="8" rx="2" fill={accent} opacity=".8"/>
      <rect x="98" y="62.5" width="4" height="5" rx="1" fill={accent} opacity=".55"/>
      {/* front light */}
      <ellipse cx="178" cy="72" rx="7" ry="5" fill={accent} opacity=".5"/>
      <ellipse cx="178" cy="72" rx="4" ry="2.8" fill="#fff" opacity=".9"/>
      {/* rear fender */}
      <path d="M36 64 Q28 64 26 70" stroke="#2a2a2a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function BikeSVG({ accent }: { accent: string }) {
  return (
    <svg width="200" height="110" viewBox="0 0 200 110" fill="none" style={{display:"block",margin:"0 auto"}}>
      {/* rear wheel */}
      <circle cx="30" cy="82" r="22" stroke={accent} strokeWidth="2.5" fill="none"/>
      <circle cx="30" cy="82" r="13" stroke="#2a2a2a" strokeWidth="1.8" fill="none"/>
      <circle cx="30" cy="82" r="3" fill={accent}/>
      {[[-22,0],[0,-22],[22,0],[0,22],[15,15],[-15,15],[15,-15],[-15,-15]].map(([dx,dy],i)=>(
        <line key={i} x1={30+(dx*.45)} y1={82+(dy*.45)} x2={30+(dx*.86)} y2={82+(dy*.86)} stroke="#2d2d2d" strokeWidth="1.2"/>
      ))}
      {/* front wheel */}
      <circle cx="168" cy="82" r="22" stroke={accent} strokeWidth="2.5" fill="none"/>
      <circle cx="168" cy="82" r="13" stroke="#2a2a2a" strokeWidth="1.8" fill="none"/>
      <circle cx="168" cy="82" r="3" fill={accent}/>
      {[[-22,0],[0,-22],[22,0],[0,22],[15,15],[-15,15],[15,-15],[-15,-15]].map(([dx,dy],i)=>(
        <line key={i} x1={168+(dx*.45)} y1={82+(dy*.45)} x2={168+(dx*.86)} y2={82+(dy*.86)} stroke="#2d2d2d" strokeWidth="1.2"/>
      ))}
      {/* main triangle */}
      <path d="M52 82 L84 36 L128 82 Z" stroke="#3a3a3a" strokeWidth="2.2" fill={`${accent}07`} strokeLinejoin="round"/>
      {/* seat tube */}
      <line x1="84" y1="36" x2="84" y2="22" stroke="#3a3a3a" strokeWidth="3" strokeLinecap="round"/>
      {/* saddle */}
      <path d="M70 22 Q84 16 98 22" stroke={accent} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <line x1="84" y1="22" x2="84" y2="28" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
      {/* chain stay */}
      <line x1="52" y1="82" x2="30" y2="82" stroke="#3a3a3a" strokeWidth="2.5" strokeLinecap="round"/>
      {/* fork */}
      <path d="M128 82 L144 48 L168 60" stroke="#3a3a3a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* stem */}
      <line x1="144" y1="48" x2="144" y2="30" stroke="#3a3a3a" strokeWidth="3" strokeLinecap="round"/>
      {/* handlebar */}
      <line x1="132" y1="28" x2="156" y2="28" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
      <circle cx="132" cy="28" r="3" fill={accent}/>
      <circle cx="156" cy="28" r="3" fill={accent}/>
      {/* crank */}
      <circle cx="90" cy="74" r="9" stroke={accent} strokeWidth="1.8" fill={`${accent}0d`}/>
      <line x1="81" y1="79" x2="99" y2="69" stroke={accent} strokeWidth="1.6"/>
      <circle cx="81" cy="79" r="3" fill={accent}/>
      <circle cx="99" cy="69" r="3" fill={accent}/>
      {/* battery on down tube */}
      <rect x="76" y="50" width="34" height="13" rx="3" fill="#1a1a1e" stroke={accent} strokeWidth="1.2"/>
      <rect x="79" y="53" width="24" height="7" rx="2" fill={accent} opacity=".68"/>
      {/* front light */}
      <ellipse cx="184" cy="70" rx="6" ry="4.5" fill={accent} opacity=".5"/>
      <ellipse cx="184" cy="70" rx="3.5" ry="2.5" fill="#fff" opacity=".9"/>
    </svg>
  )
}

function MopedSVG({ accent }: { accent: string }) {
  return (
    <svg width="200" height="110" viewBox="0 0 200 110" fill="none" style={{display:"block",margin:"0 auto"}}>
      {/* rear wheel */}
      <circle cx="32" cy="84" r="20" stroke={accent} strokeWidth="2.5" fill="none"/>
      <circle cx="32" cy="84" r="11" stroke="#2a2a2a" strokeWidth="2" fill="none"/>
      <circle cx="32" cy="84" r="3" fill={accent}/>
      {[[-20,0],[0,-20],[20,0],[0,20],[14,14],[-14,14],[14,-14],[-14,-14]].map(([dx,dy],i)=>(
        <line key={i} x1={32+(dx*.4)} y1={84+(dy*.4)} x2={32+(dx*.85)} y2={84+(dy*.85)} stroke="#2d2d2d" strokeWidth="1.2"/>
      ))}
      {/* front wheel */}
      <circle cx="162" cy="84" r="20" stroke={accent} strokeWidth="2.5" fill="none"/>
      <circle cx="162" cy="84" r="11" stroke="#2a2a2a" strokeWidth="2" fill="none"/>
      <circle cx="162" cy="84" r="3" fill={accent}/>
      {[[-20,0],[0,-20],[20,0],[0,20],[14,14],[-14,14],[14,-14],[-14,-14]].map(([dx,dy],i)=>(
        <line key={i} x1={162+(dx*.4)} y1={84+(dy*.4)} x2={162+(dx*.85)} y2={84+(dy*.85)} stroke="#2d2d2d" strokeWidth="1.2"/>
      ))}
      {/* body fairing */}
      <path d="M52 84 Q54 60 74 52 L112 50 Q132 50 134 60 L136 84 Z" fill="#131620" stroke="#222230" strokeWidth="1.2"/>
      {/* top cowl */}
      <path d="M76 50 Q92 38 114 42 L122 50 Z" fill="#1a1e2a" stroke={accent} strokeWidth="1"/>
      {/* windshield */}
      <path d="M110 42 L124 50 L116 50 L104 44 Z" fill={accent} opacity=".14"/>
      {/* seat */}
      <path d="M70 50 Q84 42 100 43 L98 51 Q85 51 70 53 Z" fill="#1e1e22" stroke="#2a2a2a" strokeWidth="1"/>
      {/* handlebar stem */}
      <line x1="128" y1="42" x2="128" y2="58" stroke="#3a3a3a" strokeWidth="3" strokeLinecap="round"/>
      {/* handlebar */}
      <line x1="118" y1="39" x2="138" y2="39" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
      <circle cx="118" cy="39" r="3" fill={accent}/>
      <circle cx="138" cy="39" r="3" fill={accent}/>
      {/* fork */}
      <path d="M126 58 L134 58 L162 59" stroke="#3a3a3a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="134" y1="58" x2="162" y2="84" stroke="#3a3a3a" strokeWidth="2.3" strokeLinecap="round"/>
      {/* motor block */}
      <rect x="80" y="64" width="40" height="17" rx="4" fill="#1a1e2a" stroke={accent} strokeWidth="1.2"/>
      <rect x="83" y="67" width="28" height="8" rx="2" fill={accent} opacity=".2"/>
      {/* exhaust */}
      <path d="M52 80 Q42 80 36 82" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* front light */}
      <ellipse cx="178" cy="70" rx="8" ry="6.5" fill="#131620" stroke={accent} strokeWidth="1.3"/>
      <ellipse cx="178" cy="70" rx="5" ry="3.8" fill={accent} opacity=".62"/>
      <ellipse cx="178" cy="70" rx="2.5" ry="2" fill="#fff" opacity=".95"/>
      {/* rear tail light */}
      <rect x="48" y="66" width="7" height="5" rx="1.5" fill="#e8002b" opacity=".75"/>
    </svg>
  )
}

/* ══════════════════════════════════════
   FLEET SECTION
══════════════════════════════════════ */
const FLEET = [
  { id:"scooter", name:"Taycan Scooter", desc:"Лёгкий электросамокат для последней мили — от метро до офиса. Идеален для маршрутов до 8 км.", speed:"25", range:"45", units:"1,240+", accent:C.red,   Svg: ScooterSVG },
  { id:"ebike",   name:"E-Tron Bike",    desc:"Электровелосипед с педальным ассистом. Для длинных прогулок по паркам и проспектам города.",   speed:"35", range:"80", units:"680+",   accent:"#f59e0b", Svg: BikeSVG    },
  { id:"moped",   name:"Urban Moped",    desc:"Мощный электромопед для тех, кто торопится. Быстро, тихо — для уверенного городского движения.",speed:"55", range:"120",units:"320+",   accent:C.blue,  Svg: MopedSVG   },
]

function FleetSection() {
  return (
    <section id="fleet" style={{ padding:"90px 32px", background:"rgba(8,9,10,0.78)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <SecLabel>Флот</SecLabel>
        <SecH2>Три типа транспорта.<br /><Dim>Один аккаунт.</Dim></SecH2>

        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",
          gap:2, background:C.border, borderRadius:12, overflow:"hidden",
        }}>
          {FLEET.map(v => <FleetCard key={v.id} v={v} />)}
        </div>
      </div>
    </section>
  )
}

function FleetCard({ v }: { v: typeof FLEET[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.s2 : C.s1,
        padding: "34px 28px 30px",
        cursor: "pointer", position: "relative", overflow: "hidden",
        transition: "background .22s",
      }}
    >
      {/* top accent bar */}
      <div style={{
        position:"absolute",top:0,left:0,right:0,height:3,
        background:v.accent,
        transform:`scaleX(${hov?1:0})`,transformOrigin:"left",
        transition:"transform .28s cubic-bezier(.4,0,.2,1)",
      }}/>

      <div style={{ transition:"transform .28s", transform: hov?"translateY(-4px) scale(1.03)":"none" }}>
        <v.Svg accent={v.accent} />
      </div>

      <div style={{ marginTop:20, textAlign:"center" }}>
        <div style={{ fontSize:15,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase",color:v.accent,marginBottom:6 }}>{v.name}</div>
        <div style={{ fontSize:13,color:C.gray,lineHeight:1.6,marginBottom:20 }}>{v.desc}</div>
        <div style={{ display:"flex",justifyContent:"center",gap:24 }}>
          {[["км/ч",v.speed],["км запас",v.range],["единиц",v.units]].map(([l,val])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:20,fontWeight:800,letterSpacing:"-.02em",color:v.accent }}>{val}</div>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.gray2,marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════ */
const STEPS = [
  { n:"01", ico:"📱", t:"Скачай приложение",  d:"App Store или Google Play. Регистрация по номеру телефона — без лишних данных."         },
  { n:"02", ico:"📍", t:"Найди транспорт",     d:"Карта в реальном времени: все доступные ТС рядом с тобой на интерактивной карте."      },
  { n:"03", ico:"🔓", t:"Сканируй QR",         d:"Наведи камеру — замок открыт. Поездка стартует мгновенно, оплата автоматически."       },
  { n:"04", ico:"🏁", t:"Оставь в зоне",       d:"Завершай в любой разрешённой точке. Чек — в приложении, история — в профиле."          },
]

function HowSection() {
  return (
    <section id="how" style={{ background:"rgba(8,9,10,0.82)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"90px 32px" }}>
      <div style={{ maxWidth:1100,margin:"0 auto" }}>
        <SecLabel>Как это работает</SecLabel>
        <SecH2>От регистрации<br /><Dim>до поездки — 60 секунд.</Dim></SecH2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:2,background:C.border,borderRadius:10,overflow:"hidden" }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ background:C.s1,padding:"32px 24px",position:"relative" }}>
              <div style={{ position:"absolute",top:12,right:16,fontSize:56,fontWeight:900,letterSpacing:"-.04em",color:"rgba(255,255,255,.03)",lineHeight:1,userSelect:"none" }}>{s.n}</div>
              <div style={{ fontSize:28,marginBottom:16 }}>{s.ico}</div>
              <div style={{ fontSize:15,fontWeight:700,marginBottom:8,color:C.w }}>{s.t}</div>
              <div style={{ fontSize:13,color:C.gray,lineHeight:1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   ZONES MAP
══════════════════════════════════════ */
const ZONES = [
  { name:"Аль-Фараби",           meta:"240 единиц · 12 станций", count:240, color:C.red   },
  { name:"Абая",                  meta:"189 единиц · 9 станций",  count:189, color:C.blue  },
  { name:"Медеу / Горный Гигант", meta:"124 единицы · 7 станций", count:124, color:C.green },
  { name:"Бостандык / Коктем",   meta:"98 единиц · 5 станций",   count:98,  color:C.amber },
  { name:"Достык / Самал",       meta:"76 единиц · 4 станции",   count:76,  color:C.blue  },
]

const MAP_PINS = [
  { cx:140,cy:144,c:C.red,   id:"TS-001" }, { cx:248,cy:144,c:C.blue,  id:"EB-011" },
  { cx:350,cy:144,c:C.blue,  id:"TS-004" }, { cx:180,cy:228,c:C.red,   id:"TS-007" },
  { cx:300,cy:228,c:C.green, id:"EB-003" }, { cx:420,cy:200,c:C.blue,  id:"EB-009" },
  { cx:88, cy:272,c:C.amber, id:"TS-012" },
]

function ZonesSection() {
  return (
    <section id="zones" style={{ padding:"90px 32px", background:"rgba(8,9,10,0.78)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }}>
      <div style={{ maxWidth:1100,margin:"0 auto" }}>
        <SecLabel>Зоны присутствия</SecLabel>
        <SecH2>Алматы — полностью<br /><Dim>охвачен нашей сетью.</Dim></SecH2>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:44,alignItems:"start" }}>

          {/* SVG Map */}
          <div style={{ background:C.s1,border:`1px solid ${C.border2}`,borderRadius:12,overflow:"hidden",aspectRatio:"4/3",position:"relative" }}>
            <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%" }} viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" fill="none">
              <rect width="480" height="360" fill="#0f0f11"/>
              <g stroke="#1a1a1e" strokeWidth="1">
                {[60,120,180,240,300].map(y=><line key={y} x1="0" y1={y} x2="480" y2={y}/>)}
                {[60,120,180,240,300,360,420].map(x=><line key={x} x1={x} y1="0" x2={x} y2="360"/>)}
              </g>
              <line x1="0" y1="144" x2="480" y2="144" stroke="#20252e" strokeWidth="5"/>
              <line x1="0" y1="228" x2="480" y2="228" stroke="#20252e" strokeWidth="5"/>
              <line x1="180" y1="0" x2="180" y2="360" stroke="#20252e" strokeWidth="4"/>
              <line x1="340" y1="0" x2="340" y2="360" stroke="#20252e" strokeWidth="4"/>
              <text x="16" y="137" fill="#1e2838" fontSize="8" fontFamily="monospace" letterSpacing="1">АЛЬ-ФАРАБИ</text>
              <text x="16" y="221" fill="#1e2838" fontSize="8" fontFamily="monospace" letterSpacing="1">АБАЯ</text>
              <rect x="68" y="154" width="52" height="36" fill="#131a17" rx="3"/>
              <rect x="352" y="154" width="46" height="32" fill="#131a17" rx="3"/>
              {MAP_PINS.map(p=>(
                <g key={p.id}>
                  <circle cx={p.cx} cy={p.cy} r={16} fill={`${p.c}0c`}/>
                  <circle cx={p.cx} cy={p.cy} r={9}  fill={`${p.c}1a`} stroke={p.c} strokeWidth="1.5"/>
                  <circle cx={p.cx} cy={p.cy} r={3.5} fill={p.c}/>
                  <text x={p.cx+13} y={p.cy-5} fill={p.c} fontSize="8" fontFamily="monospace">{p.id}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Zone list */}
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:C.gray2,marginBottom:4 }}>Активные зоны</div>
            {ZONES.map(z=>(
              <div key={z.name} style={{ background:C.s1,border:`1px solid ${C.border2}`,borderRadius:8,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"border-color .18s" }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor="#38383e")}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border2)}
              >
                <div style={{ width:9,height:9,borderRadius:"50%",background:z.color,flexShrink:0,boxShadow:`0 0 6px ${z.color}` }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:700,letterSpacing:".02em",textTransform:"uppercase",color:C.w }}>{z.name}</div>
                  <div style={{ fontSize:11,color:C.gray2,marginTop:2,fontFamily:"monospace" }}>{z.meta}</div>
                </div>
                <div style={{ fontSize:22,fontWeight:900,letterSpacing:"-.02em",color:C.blue }}>{z.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   PRICING
══════════════════════════════════════ */
const PLANS = [
  { name:"Старт",   price:"30",         unit:"₸/мин", featured:false, cta:"Начать бесплатно",
    feats:["Самокаты и байки","Парковка 15 мин бесплатно","История поездок"],
    miss:["Мопеды","Приоритетная поддержка"] },
  { name:"Про",     price:"990",        unit:"₸/мес", featured:true,  cta:"Попробовать 7 дней", badge:"Популярный",
    feats:["Весь флот без доп. платы","60 мин в день включено","Мопеды доступны","Приоритет на станциях","Поддержка 24/7"],
    miss:[] },
  { name:"Бизнес",  price:"По\u00a0запросу", unit:"", featured:false, cta:"Связаться с нами",
    feats:["Корпоративный кабинет","Командные аккаунты","API-интеграция","Выделенный менеджер","SLA 99.9%"],
    miss:[] },
]

function PricingSection() {
  return (
    <section id="pricing" style={{ background:"rgba(8,9,10,0.82)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"90px 32px" }}>
      <div style={{ maxWidth:1100,margin:"0 auto" }}>
        <SecLabel>Тарифы</SecLabel>
        <SecH2>Честные цены.<br /><Dim>Никакой подписки.</Dim></SecH2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:2,background:C.border,borderRadius:12,overflow:"hidden" }}>
          {PLANS.map(p=>(
            <div key={p.name} style={{ background:p.featured?C.s2:C.s1,padding:"34px 28px" }}>
              {p.badge && (
                <div style={{ display:"inline-block",padding:"3px 12px",borderRadius:100,background:"rgba(232,0,43,.1)",border:"1px solid rgba(232,0,43,.25)",fontSize:10,fontWeight:700,letterSpacing:".1em",color:C.red,textTransform:"uppercase",marginBottom:18 }}>{p.badge}</div>
              )}
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.gray2,marginBottom:10 }}>{p.name}</div>
              <div style={{ fontSize:40,fontWeight:900,letterSpacing:"-.03em",lineHeight:1,color:C.w }}>
                {p.price}{p.unit&&<span style={{ fontSize:14,fontWeight:400,color:C.gray2,marginLeft:3 }}>{p.unit}</span>}
              </div>
              <div style={{ width:"100%",height:1,background:C.border,margin:"20px 0" }}/>
              <ul style={{ listStyle:"none",display:"flex",flexDirection:"column",gap:9,marginBottom:24 }}>
                {p.feats.map(f=>(
                  <li key={f} style={{ display:"flex",alignItems:"center",gap:9,fontSize:13,color:C.gray }}>
                    <span style={{ fontSize:11,color:C.green,fontWeight:700 }}>✓</span>{f}
                  </li>
                ))}
                {p.miss.map(f=>(
                  <li key={f} style={{ display:"flex",alignItems:"center",gap:9,fontSize:13,color:C.gray2,opacity:.38 }}>
                    <span style={{ fontWeight:700 }}>✗</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth"
                style={{ display:"block",width:"100%",padding:12,borderRadius:5,border:`1px solid ${p.featured?C.red:C.border3}`,background:p.featured?C.red:"transparent",color:C.w,fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",transition:"all .18s",textDecoration:"none",textAlign:"center",boxSizing:"border-box" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=C.red;(e.currentTarget as HTMLAnchorElement).style.borderColor=C.red}}
                onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=p.featured?C.red:"transparent";(e.currentTarget as HTMLAnchorElement).style.borderColor=p.featured?C.red:C.border3}}
              >{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   REVIEWS
══════════════════════════════════════ */
const REVIEWS = [
  { text:"Пользуюсь каждый день от Алатауской до офиса на Достыке. 20 минут вместо 50 в пробках. Не понимаю, как жил без этого.", name:"Арман М.", meta:"Алматы · 3 месяца",  init:"АМ", color:C.red   },
  { text:"Взяла Pro-тариф — окупился за неделю. Байки всегда заряжены, приложение без сбоев. Дизайн отдельный кайф.",            name:"Диана А.", meta:"Алматы · 5 месяцев", init:"ДА", color:C.blue  },
  { text:"Корпоративный тариф на весь отдел из 12 человек. Затраты на такси упали на 60%. Рекомендую каждой компании.",           name:"Серик К.", meta:"CEO · Almaty Tech",   init:"СК", color:C.green },
]

function ReviewsSection() {
  return (
    <section id="reviews" style={{ padding:"90px 32px", background:"rgba(8,9,10,0.78)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }}>
      <div style={{ maxWidth:1100,margin:"0 auto" }}>
        <SecLabel>Отзывы</SecLabel>
        <SecH2>Что говорят<br /><Dim>те, кто уже едет.</Dim></SecH2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:14 }}>
          {REVIEWS.map(r=>(
            <div key={r.name} style={{ background:C.s1,border:`1px solid ${C.border2}`,borderRadius:12,padding:26,transition:"border-color .18s" }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=C.border3)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border2)}
            >
              <div style={{ display:"flex",gap:3,marginBottom:14 }}>
                {Array.from({length:5}).map((_,i)=>(
                  <div key={i} style={{ width:11,height:11,background:C.amber,clipPath:"polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }}/>
                ))}
              </div>
              <p style={{ fontSize:13,lineHeight:1.75,color:"rgba(244,244,245,.72)",marginBottom:18,fontStyle:"italic" }}>"{r.text}"</p>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:34,height:34,borderRadius:"50%",background:`${r.color}1a`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:r.color,flexShrink:0 }}>{r.init}</div>
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:C.w }}>{r.name}</div>
                  <div style={{ fontSize:11,color:C.gray2 }}>{r.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   FINAL CTA
══════════════════════════════════════ */
function FinalCTA() {
  return (
    <div style={{ background:"rgba(8,9,10,0.82)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:`1px solid ${C.border}`,padding:"110px 32px",textAlign:"center",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:520,height:380,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(232,0,43,.07) 0%,transparent 70%)",pointerEvents:"none" }}/>
      <div style={{ position:"relative" }}>
        <h2 style={{ fontSize:"clamp(2.4rem,5vw,4.2rem)",fontWeight:900,letterSpacing:"-.04em",lineHeight:1.05,color:C.w,marginBottom:18 }}>
          Алматы<br /><span style={{ color:C.red }}>не ждёт.</span>
        </h2>
        <p style={{ fontSize:15,color:C.gray,maxWidth:400,margin:"0 auto 44px",lineHeight:1.65 }}>
          Присоединись к 45,000 райдеров. Первая поездка — бесплатно.
        </p>
        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
          <Link href="/auth" style={btnRedStyle}>Зарегистрироваться →</Link>
          <button onClick={()=>scrollTo("how")} style={btnGhostStyle}>Как это работает</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ background:"rgba(8,9,10,0.90)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderTop:`1px solid ${C.border}`,padding:"44px 32px",textAlign:"center" }}>
      <div style={{ fontSize:18,fontWeight:900,letterSpacing:".06em",marginBottom:18,color:C.w }}>
        RIDE<span style={{ color:C.red }}>HUB</span>
      </div>
      <div style={{ display:"flex",gap:22,justifyContent:"center",flexWrap:"wrap",marginBottom:14 }}>
        {[["О нас","/about"],["Карта","/map"],["Контакты","/contacts"],["Условия","#"]].map(([l,h])=>(
          <Link key={l} href={h} style={{ fontSize:12,color:C.gray2,letterSpacing:".04em",textDecoration:"none",transition:"color .18s" }}
            onMouseEnter={e=>(e.currentTarget.style.color=C.w)}
            onMouseLeave={e=>(e.currentTarget.style.color=C.gray2)}
          >{l}</Link>
        ))}
      </div>
      <div style={{ fontSize:11,color:C.gray3,letterSpacing:".04em" }}>
        © 2025 RideHub · Алматы, Казахстан · Разработано Сериком Досжановым
      </div>
      <div style={{ marginTop:28,fontSize:"clamp(11px,1.6vw,17px)",fontWeight:800,letterSpacing:".22em",textTransform:"uppercase",color:"rgba(255,255,255,.06)",wordSpacing:".5em" }}>
        RIDEHUB.{" "}<span style={{ color:"rgba(0,207,255,.2)" }}>БАҚЫЛАУ</span>.{" "}ЖЫЛДАМДЫҚ. БОСТАНДЫҚ.
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════
   ATOMS
══════════════════════════════════════ */
const btnRedStyle: React.CSSProperties = {
  display:"inline-flex",alignItems:"center",gap:8,
  padding:"13px 32px",background:C.red,border:"none",borderRadius:6,
  fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
  color:"#fff",cursor:"pointer",fontFamily:"inherit",textDecoration:"none",
  transition:"background .18s",
}
const btnGhostStyle: React.CSSProperties = {
  display:"inline-flex",alignItems:"center",gap:8,
  padding:"13px 32px",background:"transparent",
  border:"1px solid rgba(255,255,255,.14)",borderRadius:6,
  fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
  color:C.w,cursor:"pointer",fontFamily:"inherit",
  transition:"all .18s",
}

function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:10,fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.red,marginBottom:16 }}>
      <span style={{ width:28,height:1,background:C.red,display:"block" }}/>{children}
    </div>
  )
}
function SecH2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize:"clamp(1.9rem,3.8vw,3rem)",fontWeight:800,letterSpacing:"-.03em",lineHeight:1.1,marginBottom:50,color:C.w }}>{children}</h2>
}
function Dim({ children }: { children: React.ReactNode }) {
  return <em style={{ fontStyle:"normal",color:C.gray2 }}>{children}</em>
}

/* ══════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════ */
export default function HomePage() {
  return (
    <div style={{ background:C.bg, color:C.w, overflowX:"hidden", fontFamily:"'Inter',-apple-system,sans-serif", position:"relative" }}>

      {/* ══ FIXED VIDEO BACKGROUND — как в /auth и /about ══ */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <source src="/city-night.mp4" type="video/mp4" />
      </video>

      <Navbar />
      <Hero />
      <StatsBar />
      <FleetSection />
      <HowSection />
      <ZonesSection />
      <PricingSection />
      <ReviewsSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}