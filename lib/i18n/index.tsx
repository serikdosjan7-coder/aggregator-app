"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import en from "./locales/en.json"
import ru from "./locales/ru.json"
import kz from "./locales/kz.json"

export type Locale = "en" | "ru" | "kz"

const LOCALES: Record<Locale, typeof en> = { en, ru, kz }
const STORAGE_KEY = "ridehub_locale"

/* ─── Context ───────────────────────────────────────────────────────────── */
interface I18nContextValue {
  locale: Locale
  t: typeof en
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextValue>({
  locale: "ru",
  t: ru,
  setLocale: () => {},
})

/* ─── Provider ──────────────────────────────────────────────────────────── */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru")

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && stored in LOCALES) setLocaleState(stored)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  return (
    <I18nContext.Provider value={{ locale, t: LOCALES[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

/* ─── Hook ──────────────────────────────────────────────────────────────── */
export function useI18n() {
  return useContext(I18nContext)
}
