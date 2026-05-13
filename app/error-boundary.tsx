"use client"

import React from "react"

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log but don't crash — browser extensions often inject DOM nodes that
    // cause hydration mismatches. We swallow those silently.
    if (process.env.NODE_ENV === "development") {
      console.warn("[ErrorBoundary]", error.message, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div suppressHydrationWarning style={{
          minHeight: "100vh", background: "#020817",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          color: "#f1f5f9", fontFamily: "system-ui, sans-serif",
          padding: 24, textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Что-то пошло не так</h2>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, maxWidth: 360 }}>
            {this.state.error?.message ?? "Произошла непредвиденная ошибка"}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            style={{
              padding: "10px 24px", borderRadius: 980, border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
