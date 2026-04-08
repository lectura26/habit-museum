'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

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
    // On success the browser is redirected to Google — no further action needed.
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 28px',
        background: '#FAF7F2',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 56,
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              lineHeight: 1.1,
              color: '#3D2B1A',
              margin: 0,
            }}
          >
            HABIT<br />MUSEUM
          </h1>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: loading ? '#8B7355' : '#3D2B1A',
            color: '#FAF7F2',
            border: 'none',
            borderRadius: 0,
            fontFamily: '"Inter", sans-serif',
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 200ms ease',
          }}
        >
          {loading ? 'REDIRECTING...' : 'CONTINUE WITH GOOGLE'}
        </button>

        {error && (
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#8B7355',
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
