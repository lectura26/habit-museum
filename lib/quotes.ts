import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export interface StoicQuote {
  id: number
  quote: string
  author: string
}

// Plain client — no SSR cookies needed for a public table.
// Safe to use inside unstable_cache (no dynamic Next.js APIs).
function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function dayOfYear(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date      = new Date(y, m - 1, d)
  const yearStart = new Date(y, 0, 0)
  return Math.floor((date.getTime() - yearStart.getTime()) / 86_400_000)
}

// Cached per dateKey — a new day means a new cache entry, so the
// quote changes automatically at midnight with no manual revalidation.
export const getDailyQuote = unstable_cache(
  async (dateKey: string): Promise<StoicQuote | null> => {
    const supabase = getPublicClient()

    const { count } = await supabase
      .from('stoic_quotes')
      .select('id', { count: 'exact', head: true })

    if (!count) return null

    const id = (dayOfYear(dateKey) % count) + 1

    const { data } = await supabase
      .from('stoic_quotes')
      .select('id, quote, author')
      .eq('id', id)
      .single()

    return data ?? null
  },
  ['daily-stoic-quote'],
  { revalidate: 3600 }  // hourly revalidation as a safety net
)
