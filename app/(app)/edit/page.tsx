import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { toLocalDateString, getWeekStart } from '@/lib/dates'
import TopBar from '@/app/components/top-bar'
import EditClient from './edit-client'

export default async function EditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = toLocalDateString(getWeekStart())

  const [
    { data: profile },
    { data: habits },
    { data: metrics },
    { data: weeklyReview },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('habits').select('*').eq('user_id', user.id).order('display_order'),
    supabase.from('user_metrics').select('*').eq('user_id', user.id).order('display_order'),
    supabase.from('weekly_reviews').select('*').eq('user_id', user.id).eq('week_start', weekStart).single(),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? ''

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <TopBar firstName={firstName} />
      <EditClient
        userId={user.id}
        habits={habits ?? []}
        metrics={metrics ?? []}
        defaultTodoCount={profile?.default_todo_count ?? 3}
        weeklyGoals={weeklyReview?.goals ?? []}
        weekStart={weekStart}
      />
    </div>
  )
}
