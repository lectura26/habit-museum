'use server'

import { createClient } from '@/lib/supabase/server'

interface LoginResult {
  success?: true
  error?: string
  destination?: string
}

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  // Surface env var problems immediately — they appear in Vercel function logs.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[loginAction] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    return { error: 'Server configuration error — Supabase env vars missing.' }
  }

  try {
    const supabase = await createClient()

    console.log('[loginAction] Attempting signInWithPassword for:', email)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('[loginAction] signInWithPassword error:', authError.message, '| status:', authError.status, '| code:', authError.code)
      return { error: authError.message }
    }

    console.log('[loginAction] Auth success — user id:', authData.user?.id, '| session expires:', authData.session?.expires_at)

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id')
      .eq('is_active', true)
      .limit(1)

    if (habitsError) {
      // Non-fatal — fall back to onboarding if we can't read habits.
      console.error('[loginAction] Habits query error:', habitsError.message, '| code:', habitsError.code)
    }

    const destination = habits && habits.length > 0 ? '/today' : '/onboarding'
    console.log('[loginAction] Redirecting to:', destination)

    return { success: true, destination }
  } catch (err) {
    // Catches anything createClient() or the Supabase calls might throw
    // (e.g. invalid URL, network failure). Returning the real message here
    // means it shows on the client AND in Vercel logs.
    const message = err instanceof Error ? err.message : String(err)
    console.error('[loginAction] Unexpected throw:', message, err)
    return { error: message }
  }
}
