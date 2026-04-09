import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ padding: '60px 28px 100px', background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <p
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 32,
          fontWeight: 400,
          color: 'var(--text-primary, #3D2B1A)',
        }}
      >
        Today
      </p>
      <p
        style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: 12,
          color: 'var(--text-muted, #8B7355)',
          marginTop: 12,
        }}
      >
        Logged in as {user.email}
      </p>
    </div>
  )
}
