"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", color: "#fff" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>О проекте RideHub</h1>
      <p style={{ fontSize: "16px", marginBottom: "30px", color: "#ccc", maxWidth: "600px" }}>
        RideHub — это современный агрегатор услуг шеринга электросамокатов и велосипедов. 
        Мы собираем все доступные варианты микромобильности в одном приложении.
      </p>
      
      <Link
        href="/contacts"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "13px 32px",
          background: "#FF3B30",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "#fff",
          textDecoration: "none"
        }}
      >
        Написать нам →
      </Link>
    </div>
  );
}