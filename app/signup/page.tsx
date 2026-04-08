'use client'

import { createBrowserClient } from '@supabase/ssr'

export default function SignupPage() {
  function handleGoogleLogin() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 28px',
      background: '#FAF7F2',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 48,
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: '#3D2B1A',
          textAlign: 'center',
          marginBottom: 60,
        }}>
          HABIT<br />MUSEUM
        </h1>

        <button
          onClick={handleGoogleLogin}
          style={{
            display: 'block',
            width: '100%',
            padding: '18px',
            background: '#3D2B1A',
            color: '#FAF7F2',
            border: 'none',
            fontSize: 12,
            fontFamily: 'sans-serif',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            cursor: 'pointer',
          }}
        >
          CONTINUE WITH GOOGLE
        </button>

      </div>
    </div>
  )
}
