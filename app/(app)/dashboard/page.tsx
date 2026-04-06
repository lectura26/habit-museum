import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { toLocalDateString, getMonthStart } from '@/lib/dates'
import TopBar from '@/app/components/top-bar'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today      = toLocalDateString()
  const monthStart = toLocalDateString(getMonthStart())

  const [
    { data: profile },
    { data: habits },
    { data: completions },
    { data: metrics },
    { data: checkinEntries },
    { data: intentions },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
    supabase.from('habit_completions')
      .select('date, habit_id')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', today),
    supabase.from('user_metrics').select('*').eq('user_id', user.id).eq('is_active', true).order('display_order'),
    supabase.from('checkin_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', today)
      .order('date'),
    supabase.from('daily_intentions')
      .select('date, status')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', today),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? ''

  const last30Dates: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last30Dates.push(toLocalDateString(d))
  }

  const habitsChartData = last30Dates.map(date => {
    const dayComp = (completions ?? []).filter(c => c.date === date).length
    const pct = (habits ?? []).length > 0 ? Math.round((dayComp / (habits ?? []).length) * 100) : 0
    return { date, pct }
  })

  const perHabitStats = (habits ?? []).map(habit => {
    const habitComps = (completions ?? []).filter(c => c.habit_id === habit.id)
    const pct = Math.round((habitComps.length / last30Dates.length) * 100)

    let streak = 0
    for (let i = 0; i < last30Dates.length; i++) {
      const date = last30Dates[last30Dates.length - 1 - i]
      if (habitComps.some(c => c.date === date)) streak++
      else break
    }

    const sortedDates = habitComps.map(c => c.date).sort()
    let bestStreak = 0, cur = 0
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) { cur = 1; continue }
      const diff = (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i-1]).getTime()) / 86400000
      if (diff === 1) { cur++; if (cur > bestStreak) bestStreak = cur }
      else cur = 1
    }

    return { id: habit.id, name: habit.name, pct, streak, bestStreak }
  })

  const checkinDates = [...new Set((checkinEntries ?? []).map(c => c.date))].sort().reverse()
  let checkinStreak = 0
  const now = new Date()
  for (let i = 0; i < checkinDates.length; i++) {
    const expected = new Date(now)
    expected.setDate(expected.getDate() - i)
    if (checkinDates[i] === toLocalDateString(expected)) checkinStreak++
    else break
  }

  const metricChartData = (metrics ?? []).map(metric => {
    const entries = (checkinEntries ?? []).filter(e => e.metric_id === metric.id)
    const data = last30Dates.map(date => {
      const e = entries.find(en => en.date === date)
      return { date, value: e?.value_number ?? null }
    })
    return { metric, data }
  })

  const todosAll     = intentions ?? []
  const todosDone    = todosAll.filter(t => t.status === 'done').length
  const todosPartial = todosAll.filter(t => t.status === 'partial').length
  const todosNotDone = todosAll.filter(t => t.status === 'not_done').length
  const todosPct     = todosAll.length > 0
    ? Math.round(((todosDone + todosPartial * 0.5) / todosAll.length) * 100)
    : 0

  const todoChartData = last30Dates.map(date => {
    const dayTodos = todosAll.filter(t => t.date === date)
    const dayDone  = dayTodos.filter(t => t.status === 'done').length
    const pct      = dayTodos.length > 0 ? Math.round((dayDone / dayTodos.length) * 100) : 0
    return { date, pct }
  })

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <TopBar firstName={firstName} />
      <DashboardClient
        habitsChartData={habitsChartData}
        perHabitStats={perHabitStats}
        checkinStreak={checkinStreak}
        metricChartData={metricChartData}
        todosPct={todosPct}
        todosDone={todosDone}
        todosPartial={todosPartial}
        todosNotDone={todosNotDone}
        todoChartData={todoChartData}
        avgSet={todosAll.length / 30}
        avgDone={todosDone / 30}
      />
    </div>
  )
}
