import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { toLocalDateString, getWeekStart, getMonthStart } from '@/lib/dates'
import TopBar from '@/app/components/top-bar'
import ReviewClient from './review-client'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today      = toLocalDateString()
  const weekStart  = toLocalDateString(getWeekStart())
  const weekEnd    = today
  const monthStart = toLocalDateString(getMonthStart())

  const [
    { data: profile },
    { data: habits },
    { data: completions },
    { data: checkins },
    { data: intentions },
    { data: weeklyReview },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
    supabase.from('habit_completions')
      .select('date, habit_id')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', today),
    supabase.from('checkin_entries')
      .select('date')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .lte('date', weekEnd),
    supabase.from('daily_intentions')
      .select('date, status')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .lte('date', weekEnd),
    supabase.from('weekly_reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single(),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? ''

  // 30-day chart
  const last30: { date: string; pct: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = toLocalDateString(d)
    const dayComp = (completions ?? []).filter(c => c.date === ds)
    const pct = (habits ?? []).length > 0
      ? Math.round((dayComp.length / (habits ?? []).length) * 100)
      : 0
    last30.push({ date: ds, pct })
  }

  // Weekly stats
  const weekDays  = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const weekDates: string[] = []
  const ws = getWeekStart()
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws)
    d.setDate(ws.getDate() + i)
    weekDates.push(toLocalDateString(d))
  }
  const weekCheckinDates = new Set((checkins ?? []).map(c => c.date))
  const weekCheckinDots  = weekDates.map(d => weekCheckinDates.has(d))

  const weekCompletions = (completions ?? []).filter(c => c.date >= weekStart && c.date <= weekEnd)
  const weekTotal    = (habits ?? []).length * 7
  const weekPct      = weekTotal > 0 ? Math.round((weekCompletions.length / weekTotal) * 100) : 0

  const weekIntentions = intentions ?? []
  const todosDone    = weekIntentions.filter(i => i.status === 'done').length
  const todosTotal   = weekIntentions.length
  const todosPartial = weekIntentions.filter(i => i.status === 'partial').length

  // Monthly stats
  const monthCompletions = (completions ?? []).filter(c => c.date >= monthStart && c.date <= today)
  const monthDaysElapsed = Math.ceil((new Date().getTime() - new Date(monthStart).getTime()) / 86400000) + 1
  const monthTotal = (habits ?? []).length * monthDaysElapsed
  const monthPct   = monthTotal > 0 ? Math.round((monthCompletions.length / monthTotal) * 100) : 0

  const habitCompletionCounts: Record<string, number> = {}
  for (const c of monthCompletions) {
    habitCompletionCounts[c.habit_id] = (habitCompletionCounts[c.habit_id] ?? 0) + 1
  }
  const sortedHabits = (habits ?? []).slice().sort(
    (a, b) => (habitCompletionCounts[b.id] ?? 0) - (habitCompletionCounts[a.id] ?? 0)
  )
  const bestHabit  = sortedHabits[0]?.name ?? '—'
  const worstHabit = sortedHabits[sortedHabits.length - 1]?.name ?? '—'

  const allDates = [...new Set((completions ?? []).map(c => c.date))].sort()
  let bestStreak = 0, curStreak = 0
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) { curStreak = 1; continue }
    const diff = (new Date(allDates[i]).getTime() - new Date(allDates[i - 1]).getTime()) / 86400000
    if (diff === 1) { curStreak++; if (curStreak > bestStreak) bestStreak = curStreak }
    else curStreak = 1
  }

  const rate       = monthPct / 100
  const prediction = rate > 0 ? Math.round(Math.pow(rate, 90) * 100) : 0

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <TopBar firstName={firstName} />
      <ReviewClient
        userId={user.id}
        weekStart={weekStart}
        weekPct={weekPct}
        weekDays={weekDays}
        weekCheckinDots={weekCheckinDots}
        todosDone={todosDone}
        todosTotal={todosTotal}
        todosPartial={todosPartial}
        monthPct={monthPct}
        last30={last30}
        bestStreak={bestStreak}
        bestHabit={bestHabit}
        worstHabit={worstHabit}
        prediction={prediction}
        existingReview={weeklyReview ?? null}
      />
    </div>
  )
}
