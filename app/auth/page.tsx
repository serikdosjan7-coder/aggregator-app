'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n'
import { LangSwitcher } from '@/components/LangSwitcher'

export default function AuthPage() {
  const { t } = useI18n()
  const [isMounted, setIsMounted] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => { setIsMounted(true) }, [])

  if (!isMounted) {
    return <div style={{ background: '#040507', minHeight: '100vh' }} />
  }

  const supabase = createSupabaseBrowserClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? t.auth.err_invalid
          : error.message,
      )
      setLoading(false)
      return
    }

    // Super-admin redirect
    if (data.user?.email === 'admin@ridehub.kz') {
      window.location.href = '/admin'
      return
    }

    window.location.href = '/map'
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(
        error.message === 'User already registered'
          ? t.auth.err_exists
          : error.message,
      )
      setLoading(false)
      return
    }

    setMessage(t.auth.confirm_sent)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: '#0A0A0A',
    border: '1px solid #1A1A1A',
    borderRadius: 4,
    color: '#FFFFFF',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
    transition: 'border-color 150ms',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#A0A0A0',
    marginBottom: 6,
  }

  return (
    <div
      data-testid="auth-page"
      style={{
        minHeight: '100vh',
        background: '#040507',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
        position: 'relative',
      }}
    >
      {/* Video background — TODO: Serik, change to your real video filename here */}
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
      {/* Lang switcher */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
        <LangSwitcher />
      </div>

      {/* ── Form card ── */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          padding: '40px 32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Wordmark */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: '#e8002b',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          {t.auth.wordmark}
        </p>

        {/* Title */}
        <h1
          className="heading-auto"
          style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}
        >
          {t.auth.title}
        </h1>
        <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 32 }}>
          {isSignUp ? t.auth.subtitle_signup : t.auth.subtitle_signin}
        </p>

        {/* Form */}
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t.auth.label_email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.placeholder_email}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#e8002b')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#1A1A1A')}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>{t.auth.label_password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.placeholder_password}
              required
              minLength={6}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#e8002b')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#1A1A1A')}
            />
          </div>

          {/* Forgot password link */}
          {!isSignUp && (
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link
                href="/auth/reset-password"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#e8002b',
                  textDecoration: 'none',
                  transition: 'color 150ms',
                }}
              >
                {t.auth.forgot_password} →
              </Link>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                border: '1px solid #e8002b',
                borderRadius: 4,
                padding: '10px 14px',
                color: '#FFFFFF',
                fontSize: 13,
                marginBottom: 16,
                background: 'rgba(232,0,43,0.08)',
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div
              style={{
                border: '1px solid #1A1A1A',
                borderRadius: 4,
                padding: '10px 14px',
                color: '#A0A0A0',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: 13 }}
          >
            {loading ? '...' : isSignUp ? t.auth.btn_signup : t.auth.btn_signin}
          </button>
        </form>

        {/* Divider */}
        <div style={{ height: 1, background: '#1A1A1A', margin: '24px 0' }} />

        {/* Toggle */}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
            setMessage(null)
          }}
          className="btn-secondary"
          style={{ width: '100%', padding: '11px', fontSize: 12 }}
        >
          {isSignUp ? t.auth.btn_toggle_to_signin : t.auth.btn_toggle_to_signup}
        </button>
      </div>

      {/* ── Bottom quote ── */}
      <p
        style={{
          marginTop: 32,
          fontSize: 12,
          color: '#A0A0A0',
          fontStyle: 'italic',
          letterSpacing: '0.04em',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {t.auth.quote}
      </p>
    </div>
  )
}
