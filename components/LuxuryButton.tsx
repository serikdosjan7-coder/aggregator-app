"use client"

import { useState } from "react"
import Link from "next/link"

interface LuxuryButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: "primary" | "ghost"
  style?: React.CSSProperties
}

export function LuxuryButton({ href, onClick, children, variant = "primary", style }: LuxuryButtonProps) {
  const [hovered, setHovered] = useState(false)

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 40px",
    borderRadius: 9999,           /* fully rounded — organic, luxury feel */
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    textDecoration: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 200ms, border-color 200ms, color 200ms",
    ...style,
  }

  const primaryStyle: React.CSSProperties = {
    ...base,
    background: hovered
      ? "rgba(232,0,43,0.15)"
      : "rgba(255,255,255,0.06)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: `1px solid ${hovered ? "#e8002b" : "rgba(255,255,255,0.15)"}`,
    color: "#FFFFFF",
  }

  const ghostStyle: React.CSSProperties = {
    ...base,
    background: "transparent",
    border: `1px solid ${hovered ? "#e8002b" : "rgba(255,255,255,0.2)"}`,
    color: hovered ? "#FFFFFF" : "#A0A0A0",
  }

  const computed = variant === "primary" ? primaryStyle : ghostStyle

  if (href) {
    return (
      <Link
        href={href}
        style={computed}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      style={computed}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}
