'use server'

import { createClient } from '@/lib/supabase/server'

interface LoginResult {
  error?: string
  destination?: string
}

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const { data: habits } = await supabase
    .from('habits')
    .select('id')
    .eq('is_active', true)
    .limit(1)

  return {
    destination: habits && habits.length > 0 ? '/today' : '/onboarding',
  }
}
