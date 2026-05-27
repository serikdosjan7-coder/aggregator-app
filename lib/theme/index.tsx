"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export type Theme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
})

const STORAGE_KEY = "ridehub_theme"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === "light" || stored === "dark") setThemeState(stored)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
  }, [])

  const toggle = useCallback(() => {
    setThemeState(prev => {
      const next: Theme = prev === "dark" ? "light" : "dark"
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  /* Apply CSS variables to :root */
  useEffect(() => {
    const root = document.documentElement
    if (theme === "light") {
      root.style.setProperty("--bg-primary",   "#F4F4F5")
      root.style.setProperty("--bg-secondary", "#FFFFFF")
      root.style.setProperty("--bg-card",      "#FFFFFF")
      root.style.setProperty("--border",       "#E4E4E7")
      root.style.setProperty("--text-primary", "#09090B")
      root.style.setProperty("--text-muted",   "#71717A")
      root.style.setProperty("--accent",       "#e8002b")
    } else {
      root.style.setProperty("--bg-primary",   "#040507")
      root.style.setProperty("--bg-secondary", "#0A0A0A")
      root.style.setProperty("--bg-card",      "#121212")
      root.style.setProperty("--border",       "#1A1A1A")
      root.style.setProperty("--text-primary", "#FFFFFF")
      root.style.setProperty("--text-muted",   "#A0A0A0")
      root.style.setProperty("--accent",       "#e8002b")
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
