"use client"

import { useI18n, type Locale } from "@/lib/i18n"

const LANGS: Locale[] = ["kz", "en", "ru"]

export function LangSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {LANGS.map((lang, i) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          style={{
            padding: "5px 10px",
            background: locale === lang ? "#e8002b" : "rgba(15,17,21,0.75)",
            color: locale === lang ? "#FFFFFF" : "#8895a5",
            border: "none",
            borderRight: i < LANGS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background-color 150ms, color 150ms",
          }}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
