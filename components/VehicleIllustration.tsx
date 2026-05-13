"use client"

type VehicleType = "scooter" | "ebike" | "bike" | "moped"

interface Props {
  type: VehicleType
  size?: number
  color?: string
}

/* Clean, minimal SVG illustrations — no external images required */
export function VehicleIllustration({ type, size = 120, color = "#FFFFFF" }: Props) {
  const dim = { width: size, height: size * 0.75 }
  const s = color
  const m = "rgba(139,0,0,0.7)"   /* accent — red glow on wheels */

  if (type === "scooter" || type === "ebike") {
    return (
      <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: dim.width, height: dim.height, display: "block" }}>
        {/* Rear wheel */}
        <circle cx="30" cy="82" r="22" stroke={s} strokeWidth="3" fill="none" opacity="0.9"/>
        <circle cx="30" cy="82" r="8"  fill={m} opacity="0.6"/>
        <circle cx="30" cy="82" r="3"  fill={s}/>
        {/* Front wheel */}
        <circle cx="128" cy="82" r="22" stroke={s} strokeWidth="3" fill="none" opacity="0.9"/>
        <circle cx="128" cy="82" r="8"  fill={m} opacity="0.6"/>
        <circle cx="128" cy="82" r="3"  fill={s}/>
        {/* Deck / frame */}
        <rect x="42" y="62" width="60" height="8" rx="4" fill={s} opacity="0.7"/>
        {/* Frame strut rear */}
        <path d="M30 82 L52 42 L90 42 L128 82" stroke={s} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85"/>
        {/* Handlebar stem */}
        <line x1="108" y1="42" x2="116" y2="22" stroke={s} strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
        {/* Handlebar */}
        <line x1="106" y1="22" x2="126" y2="22" stroke={s} strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
        {/* Headlight */}
        <circle cx="128" cy="58" r="5" fill={m} opacity="0.8"/>
        <circle cx="128" cy="58" r="2" fill={s}/>
        {/* Battery indicator (ebike only) */}
        {type === "ebike" && (
          <rect x="60" y="36" width="24" height="10" rx="2" stroke={s} strokeWidth="1.5" fill="none" opacity="0.6"/>
        )}
      </svg>
    )
  }

  if (type === "bike") {
    return (
      <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: dim.width, height: dim.height, display: "block" }}>
        {/* Rear wheel */}
        <circle cx="32" cy="78" r="26" stroke={s} strokeWidth="3" fill="none" opacity="0.9"/>
        <circle cx="32" cy="78" r="9"  fill="rgba(255,255,255,0.08)"/>
        <circle cx="32" cy="78" r="3"  fill={s}/>
        {/* Spokes */}
        {[0,60,120,180,240,300].map(a => (
          <line key={a}
            x1={32 + 3 * Math.cos(a * Math.PI/180)}
            y1={78 + 3 * Math.sin(a * Math.PI/180)}
            x2={32 + 26 * Math.cos(a * Math.PI/180)}
            y2={78 + 26 * Math.sin(a * Math.PI/180)}
            stroke={s} strokeWidth="1" opacity="0.3"/>
        ))}
        {/* Front wheel */}
        <circle cx="128" cy="78" r="26" stroke={s} strokeWidth="3" fill="none" opacity="0.9"/>
        <circle cx="128" cy="78" r="9"  fill="rgba(255,255,255,0.08)"/>
        <circle cx="128" cy="78" r="3"  fill={s}/>
        {[0,60,120,180,240,300].map(a => (
          <line key={a}
            x1={128 + 3 * Math.cos(a * Math.PI/180)}
            y1={78 + 3 * Math.sin(a * Math.PI/180)}
            x2={128 + 26 * Math.cos(a * Math.PI/180)}
            y2={78 + 26 * Math.sin(a * Math.PI/180)}
            stroke={s} strokeWidth="1" opacity="0.3"/>
        ))}
        {/* Frame triangle */}
        <path d="M32 78 L80 30 L128 78" stroke={s} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85"/>
        <line x1="80" y1="30" x2="80" y2="78" stroke={s} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="80" y1="78" x2="128" y2="78" stroke={s} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
        {/* Seat */}
        <line x1="68" y1="30" x2="92" y2="30" stroke={s} strokeWidth="3.5" strokeLinecap="round" opacity="0.9"/>
        {/* Handlebar post */}
        <line x1="118" y1="50" x2="118" y2="32" stroke={s} strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
        {/* Handlebar */}
        <line x1="110" y1="32" x2="126" y2="32" stroke={s} strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
      </svg>
    )
  }

  /* moped */
  return (
    <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: dim.width, height: dim.height, display: "block" }}>
      {/* Rear wheel */}
      <circle cx="28" cy="82" r="22" stroke={s} strokeWidth="3" fill="none" opacity="0.9"/>
      <circle cx="28" cy="82" r="7"  fill={m} opacity="0.5"/>
      <circle cx="28" cy="82" r="3"  fill={s}/>
      {/* Front wheel */}
      <circle cx="130" cy="82" r="22" stroke={s} strokeWidth="3" fill="none" opacity="0.9"/>
      <circle cx="130" cy="82" r="7"  fill={m} opacity="0.5"/>
      <circle cx="130" cy="82" r="3"  fill={s}/>
      {/* Body */}
      <path d="M28 82 C28 58 44 40 72 36 L100 36 C118 36 132 52 132 82"
        stroke={s} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
      {/* Seat */}
      <rect x="56" y="28" width="40" height="10" rx="5" fill={s} opacity="0.75"/>
      {/* Handlebar stem */}
      <line x1="116" y1="36" x2="122" y2="18" stroke={s} strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
      {/* Handlebar */}
      <line x1="114" y1="18" x2="130" y2="18" stroke={s} strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
      {/* Headlight */}
      <ellipse cx="132" cy="60" rx="5" ry="7" fill={m} opacity="0.8"/>
      <ellipse cx="132" cy="60" rx="2" ry="3" fill={s}/>
      {/* Exhaust */}
      <path d="M28 76 L14 80 L10 88" stroke={s} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}
