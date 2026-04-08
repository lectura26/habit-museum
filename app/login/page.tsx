'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://habit-museum.vercel.app/auth/callback',
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
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

        <div>
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
            type="button"
            className="btn-primary"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              background: '#3D2B1A',
              color: '#FAF7F2',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'REDIRECTING...' : 'CONTINUE WITH GOOGLE'}
          </button>
        </div>

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
