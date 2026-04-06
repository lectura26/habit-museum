import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { toLocalDateString, getYesterdayString } from '@/lib/dates'
import TopBar from '@/app/components/top-bar'
import TodayClient from './today-client'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today     = toLocalDateString()
  const yesterday = getYesterdayString()

  const [
    { data: profile },
    { data: habits },
    { data: completions },
    { data: metrics },
    { data: checkins },
    { data: todosYesterday },
    { data: todosToday },
    { data: streakData },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('display_order'),
    supabase.from('habit_completions').select('*').eq('user_id', user.id).eq('date', today),
    supabase.from('user_metrics').select('*').eq('user_id', user.id).eq('is_active', true).order('display_order'),
    supabase.from('checkin_entries').select('*').eq('user_id', user.id).eq('date', today),
    supabase.from('daily_intentions').select('*').eq('user_id', user.id).eq('date', yesterday).order('display_order'),
    supabase.from('daily_intentions').select('*').eq('user_id', user.id).eq('date', today).order('display_order'),
    supabase.from('habit_completions').select('date').eq('user_id', user.id).order('date', { ascending: false }).limit(365),
  ])

  function calcStreak(dates: { date: string }[] | null): number {
    if (!dates || dates.length === 0) return 0
    const uniqueDates = [...new Set(dates.map(d => d.date))].sort().reverse()
    let streak = 0
    const now = new Date()
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(now)
      expected.setDate(expected.getDate() - i)
      if (uniqueDates[i] === toLocalDateString(expected)) streak++
      else break
    }
    return streak
  }

  const streak           = calcStreak(streakData)
  const firstName        = profile?.full_name?.split(' ')[0] ?? ''
  const defaultTodoCount = profile?.default_todo_count ?? 3
  const alreadySubmitted = profile?.last_submitted_date === today

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <TopBar firstName={firstName} streak={streak} />
      <TodayClient
        userId={user.id}
        today={today}
        yesterday={yesterday}
        habits={habits ?? []}
        completions={completions ?? []}
        metrics={metrics ?? []}
        checkins={checkins ?? []}
        todosYesterday={todosYesterday ?? []}
        todosToday={todosToday ?? []}
        defaultTodoCount={defaultTodoCount}
        alreadySubmitted={alreadySubmitted}
      />
    </div>
  )
}
