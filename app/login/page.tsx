'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [debug, setDebug]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    console.log('AUTH RESULT:', JSON.stringify({ data, error: authError }))
    setDebug(JSON.stringify({ data, error: authError }, null, 2))

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    window.location.href = '/today'
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

        <form onSubmit={handleLogin}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 40 }}>
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
                autoComplete="current-password"
                required
                className="input-line"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
            {loading ? 'ENTERING...' : 'ENTER'}
          </button>

          {debug && (
            <pre
              style={{
                marginTop: 24,
                padding: 12,
                background: '#f0ebe3',
                border: '1px solid #C4A882',
                fontSize: 11,
                lineHeight: 1.5,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                color: '#3D2B1A',
              }}
            >
              {debug}
            </pre>
          )}
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
          No account?{' '}
          <Link
            href="/signup"
            style={{ color: 'var(--accent-dark)', textDecoration: 'none', fontWeight: 500 }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
