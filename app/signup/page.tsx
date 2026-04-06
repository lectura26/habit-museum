'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('PASSWORDS DO NOT MATCH')
      return
    }
    if (password.length < 6) {
      setError('PASSWORD TOO SHORT')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/today`,
      },
    })

    if (authError) {
      setError(authError.message.toUpperCase())
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div
        className="animate-fade-in"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 28px',
          textAlign: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: 48,
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--text-primary)',
            marginBottom: 24,
            lineHeight: 1.1,
          }}
        >
          CHECK YOUR EMAIL
        </h2>
        <p
          className="font-ui"
          style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}
        >
          We sent you a confirmation link.
        </p>
      </div>
    )
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 28px',
        background: 'var(--bg-primary)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1
            className="font-display"
            style={{
              fontSize: 56,
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
            }}
          >
            HABIT<br />MUSEUM
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 40 }}>
            <div>
              <label className="label" htmlFor="name" style={{ display: 'block', marginBottom: 8 }}>
                NAME
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                className="input-line"
                placeholder="First name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="email" style={{ display: 'block', marginBottom: 8 }}>
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input-line"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="password" style={{ display: 'block', marginBottom: 8 }}>
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-line"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="confirm" style={{ display: 'block', marginBottom: 8 }}>
                CONFIRM PASSWORD
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                className="input-line"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p
              className="font-ui"
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p
          className="font-ui"
          style={{
            fontSize: 13,
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginTop: 28,
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--accent-dark)', textDecoration: 'none', fontWeight: 500 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
