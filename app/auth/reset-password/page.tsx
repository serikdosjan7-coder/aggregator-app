'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n'
import { LangSwitcher } from '@/components/LangSwitcher'

export default function ResetPasswordPage() {
  const { t } = useI18n()
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ── New password flow (when user arrives via email link) ── */
  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetDone, setResetDone] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const supabase = createSupabaseBrowserClient()

    // Listen for PASSWORD_RECOVERY event — fires when user clicks the email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [isMounted])

  if (!isMounted) {
    return <div style={{ background: '#000000', minHeight: '100vh' }} />
  }

  const supabase = createSupabaseBrowserClient()

  /* ── Send recovery email ── */
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  /* ── Set new password ── */
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError(t.reset.err_mismatch)
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setResetDone(true)
    setLoading(false)
    // Redirect to auth after short delay
    setTimeout(() => router.push('/auth'), 2000)
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
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
        position: 'relative',
      }}
    >
      {/* Lang switcher */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <LangSwitcher />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#121212',
          border: '1px solid #1A1A1A',
          borderRadius: 4,
          padding: '40px 32px',
        }}
      >
        {/* Wordmark */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: '#8B0000',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          RideHub
        </p>

        {/* ── State: password updated ── */}
        {resetDone ? (
          <div style={{ textAlign: 'center' }}>
            <h1 className="heading-auto" style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              {t.reset.success_reset}
            </h1>
            <p style={{ fontSize: 13, color: '#A0A0A0' }}>Redirecting...</p>
          </div>

        /* ── State: recovery session active — set new password ── */
        ) : isRecoverySession ? (
          <>
            <h1 className="heading-auto" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {t.reset.new_password_title}
            </h1>
            <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 32 }}>
              {t.reset.new_password_subtitle}
            </p>

            <form onSubmit={handleSetPassword}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{t.reset.label_password}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#8B0000')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1A1A1A')}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{t.reset.label_confirm}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#8B0000')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1A1A1A')}
                />
              </div>

              {error && (
                <div
                  style={{
                    border: '1px solid #8B0000',
                    borderRadius: 4,
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: 13,
                    marginBottom: 16,
                    background: '#0A0000',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: 13 }}
              >
                {loading ? '...' : t.reset.btn_set}
              </button>
            </form>
          </>

        /* ── State: link sent ── */
        ) : sent ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 40, height: 40,
                border: '1px solid #8B0000',
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 18, color: '#8B0000',
              }}
            >
              ✓
            </div>
            <h1 className="heading-auto" style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              {t.reset.success}
            </h1>
            <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 24 }}>
              {email}
            </p>
            <Link
              href="/auth"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#8B0000',
                textDecoration: 'none',
              }}
            >
              {t.reset.back_to_auth}
            </Link>
          </div>

        /* ── State: default — enter email ── */
        ) : (
          <>
            <h1 className="heading-auto" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {t.reset.title}
            </h1>
            <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 32 }}>
              {t.reset.subtitle}
            </p>

            <form onSubmit={handleSendLink}>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{t.reset.label_email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@ridehub.kz"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#8B0000')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1A1A1A')}
                />
              </div>

              {error && (
                <div
                  style={{
                    border: '1px solid #8B0000',
                    borderRadius: 4,
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: 13,
                    marginBottom: 16,
                    background: '#0A0000',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: 13 }}
              >
                {loading ? t.reset.btn_sending : t.reset.btn_send}
              </button>
            </form>

            <div style={{ height: 1, background: '#1A1A1A', margin: '24px 0' }} />

            <Link
              href="/auth"
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A0A0A0',
                textDecoration: 'none',
                transition: 'color 150ms',
              }}
            >
              {t.reset.back_to_auth}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
