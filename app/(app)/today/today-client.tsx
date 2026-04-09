'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitCompletion, UserMetric, CheckinEntry, DailyIntention, TaskStatus } from '@/lib/types/database'

interface TodayClientProps {
  userId: string
  today: string
  yesterday?: string
  habits: Habit[]
  completions: HabitCompletion[]
  metrics: UserMetric[]
  checkins: CheckinEntry[]
  todosYesterday: DailyIntention[]
  todosToday: DailyIntention[]
  defaultTodoCount: number
  alreadySubmitted: boolean
}

type CheckinValueMap = Record<string, {
  value_number?: number | null
  value_text?: string | null
  value_boolean?: boolean | null
  value_emotions?: string[] | null
}>

export default function TodayClient({
  userId,
  today,
  habits,
  completions,
  metrics,
  checkins,
  todosYesterday,
  todosToday,
  defaultTodoCount,
  alreadySubmitted,
}: TodayClientProps) {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const [saveError, setSaveError] = useState<string | null>(null)

  async function checked(promise: PromiseLike<{ error: { message: string } | null }>) {
    const result = await promise
    if (result.error) setSaveError(result.error.message)
    else setSaveError(null)
  }

  // ─── Submit Day ──────────────────────────────────────────────
  const [submitted, setSubmitted] = useState(alreadySubmitted)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmitDay() {
    if (submitting || submitted) return
    setSubmitting(true)
    const { error } = await supabase
      .from('profiles')
      .update({ last_submitted_date: today })
      .eq('user_id', userId)
    if (error) setSaveError(error.message)
    else setSubmitted(true)
    setSubmitting(false)
  }

  // ─── Habits state ───────────────────────────────────────────
  const [checkedHabits, setCheckedHabits] = useState<Set<string>>(
    () => new Set(completions.filter(c => c.completed).map(c => c.habit_id))
  )

  async function toggleHabit(habitId: string) {
    const wasChecked = checkedHabits.has(habitId)
    setCheckedHabits(prev => {
      const next = new Set(prev)
      if (wasChecked) next.delete(habitId)
      else next.add(habitId)
      return next
    })

    if (wasChecked) {
      await checked(supabase
        .from('habit_completions')
        .delete()
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .eq('date', today))
    } else {
      await checked(supabase
        .from('habit_completions')
        .upsert({ user_id: userId, habit_id: habitId, date: today, completed: true }))
    }
  }

  const completedCount = checkedHabits.size
  const habitProgress  = habits.length > 0 ? (completedCount / habits.length) * 100 : 0

  // ─── Check-in state ─────────────────────────────────────────
  const initCheckinValues = (): CheckinValueMap => {
    const map: CheckinValueMap = {}
    for (const c of checkins) {
      map[c.metric_id] = {
        value_number:   c.value_number,
        value_text:     c.value_text,
        value_boolean:  c.value_boolean,
        value_emotions: c.value_emotions,
      }
    }
    return map
  }

  const [checkinValues, setCheckinValues] = useState<CheckinValueMap>(initCheckinValues)
  const [checkinStreak, setCheckinStreak] = useState(0)

  useEffect(() => {
    const client = supabaseRef.current
    client
      .from('checkin_entries')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(365)
      .then(({ data }) => {
        if (!data) return
        const dates = [...new Set(data.map(d => d.date))].sort().reverse()
        let streak = 0
        const now = new Date()
        for (let i = 0; i < dates.length; i++) {
          const expected = new Date(now)
          expected.setDate(expected.getDate() - i)
          const ymd = `${expected.getFullYear()}-${String(expected.getMonth()+1).padStart(2,'0')}-${String(expected.getDate()).padStart(2,'0')}`
          if (dates[i] === ymd) streak++
          else break
        }
        setCheckinStreak(streak)
      })
  }, [userId])

  const checkinTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  function saveCheckin(metricId: string, values: CheckinValueMap[string]) {
    clearTimeout(checkinTimers.current[metricId])
    checkinTimers.current[metricId] = setTimeout(async () => {
      await supabase.from('checkin_entries').upsert({
        user_id:   userId,
        metric_id: metricId,
        date:      today,
        ...values,
      })
    }, 500)
  }

  function updateCheckin(metricId: string, update: Partial<CheckinValueMap[string]>) {
    setCheckinValues(prev => {
      const next = { ...prev, [metricId]: { ...prev[metricId], ...update } }
      saveCheckin(metricId, next[metricId])
      return next
    })
  }

  // ─── To-do state ─────────────────────────────────────────────
  const initTodoInputs = () => {
    if (todosToday.length > 0) return todosToday.map(t => t.task_text)
    return Array(defaultTodoCount).fill('')
  }

  const [todoInputs, setTodoInputs]   = useState<string[]>(initTodoInputs)
  const [todosYestState, setTodosYestState] = useState<DailyIntention[]>(todosYesterday)
  const [yesterdayCollapsed, setYesterdayCollapsed] = useState(
    () => todosYesterday.length > 0 && todosYesterday.every(t => t.status !== null)
  )

  async function saveTaskStatus(id: string, status: TaskStatus) {
    setTodosYestState(prev =>
      prev.map(t => t.id === id ? { ...t, status } : t)
    )
    await supabase.from('daily_intentions').update({ status }).eq('id', id)
  }

  async function saveTodoOnBlur(index: number, text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const existing = todosToday[index]
    if (existing) {
      await supabase.from('daily_intentions').update({ task_text: trimmed }).eq('id', existing.id)
    } else {
      await supabase.from('daily_intentions').upsert({
        user_id: userId,
        date: today,
        task_text: trimmed,
        display_order: index,
        status: null,
      })
    }
  }

  function addTodo() {
    if (todoInputs.length >= 10) return
    setTodoInputs(prev => [...prev, ''])
  }

  function removeTodo() {
    if (todoInputs.length <= 1) return
    setTodoInputs(prev => prev.slice(0, -1))
  }

  return (
    <main className="page-content animate-fade-in" style={{ padding: '0 28px' }}>

      {saveError && (
        <div style={{ padding: '10px 0' }}>
          <p className="font-ui" style={{ fontSize: 11, color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            SAVE ERROR: {saveError}
          </p>
        </div>
      )}

      {/* ── SECTION 1: HABITS ─────────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p className="label">HABITS</p>
          <span
            className="font-ui"
            style={{ fontSize: 12, color: 'var(--accent-light)' }}
          >
            {completedCount} of {habits.length}
          </span>
        </div>

        <div>
          {habits.map((habit, i) => {
            const isChecked = checkedHabits.has(habit.id)
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < habits.length - 1 ? '1px solid var(--bg-secondary)' : 'none',
                  padding: '14px 0',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span className={`checkbox-habit ${isChecked ? 'checked' : ''}`}>
                  {isChecked && <span className="checkmark" />}
                </span>
                <span
                  className={`font-ui ${isChecked ? 'habit-checked-name' : ''}`}
                  style={{
                    fontSize: 15,
                    flex: 1,
                    color: isChecked ? 'var(--accent-light)' : 'var(--text-primary)',
                    transition: 'color 300ms ease',
                    position: 'relative',
                  }}
                >
                  {habit.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="progress-track" style={{ marginTop: 20 }}>
          <div
            className="progress-fill"
            style={{ width: `${habitProgress}%` }}
          />
        </div>
      </div>

      {/* ── SECTION 2: CHECK-IN ───────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-2">
        <p className="label" style={{ marginBottom: 24 }}>CHECK-IN</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.map(metric => {
            const val = checkinValues[metric.id] ?? {}
            return (
              <div key={metric.id}>
                {/* yes_no */}
                {metric.metric_type === 'yes_no' && (
                  <div>
                    <p className="label" style={{ marginBottom: 12 }}>{metric.metric_name}</p>
                    <div style={{ display: 'flex', gap: 24 }}>
                      {(['YES', 'NO'] as const).map(opt => {
                        const boolVal = opt === 'YES'
                        const selected = val.value_boolean === boolVal
                        return (
                          <button
                            key={opt}
                            onClick={() => updateCheckin(metric.id, { value_boolean: boolVal })}
                            className="font-ui"
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: 11,
                              textTransform: 'uppercase',
                              letterSpacing: '0.15em',
                              cursor: 'pointer',
                              color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
                              borderBottom: selected ? '1.5px solid var(--accent-dark)' : '1.5px solid transparent',
                              padding: '4px 0',
                            }}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* score_10 / score_100 */}
                {(metric.metric_type === 'score_10' || metric.metric_type === 'score_100') && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                      <p className="label">{metric.metric_name}</p>
                      <span
                        className="font-display"
                        style={{ fontSize: 20, color: 'var(--accent-dark)' }}
                      >
                        {val.value_number ?? (metric.metric_type === 'score_10' ? 5 : 50)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={metric.metric_type === 'score_10' ? 10 : 100}
                      value={val.value_number ?? (metric.metric_type === 'score_10' ? 5 : 50)}
                      onChange={e => updateCheckin(metric.id, { value_number: Number(e.target.value) })}
                    />
                  </div>
                )}

                {/* number */}
                {metric.metric_type === 'number' && (
                  <div>
                    <p className="label" style={{ marginBottom: 12 }}>{metric.metric_name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="number"
                        className="input-line"
                        style={{ flex: 1 }}
                        value={val.value_number ?? ''}
                        placeholder="0"
                        onChange={e => updateCheckin(metric.id, { value_number: e.target.value ? Number(e.target.value) : null })}
                      />
                      {metric.unit && (
                        <span className="font-ui label" style={{ flexShrink: 0 }}>{metric.unit}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* emotions */}
                {metric.metric_type === 'emotions' && (
                  <div>
                    <p className="label" style={{ marginBottom: 12 }}>{metric.metric_name}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(metric.emotion_options ?? []).map(emotion => {
                        const selected = (val.value_emotions ?? []).includes(emotion)
                        return (
                          <button
                            key={emotion}
                            onClick={() => {
                              const prev = val.value_emotions ?? []
                              const next = selected
                                ? prev.filter(e => e !== emotion)
                                : [...prev, emotion]
                              updateCheckin(metric.id, { value_emotions: next })
                            }}
                            className="font-ui"
                            style={{
                              fontSize: 11,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              padding: '6px 14px',
                              border: selected ? '1px solid var(--accent-dark)' : '1px solid var(--border)',
                              background: selected ? 'var(--accent-dark)' : 'transparent',
                              color: selected ? 'var(--bg-primary)' : 'var(--text-primary)',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            {emotion}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* freetext */}
                {metric.metric_type === 'freetext' && (
                  <div>
                    <p className="label" style={{ marginBottom: 12 }}>{metric.metric_name}</p>
                    <textarea
                      className="textarea-line"
                      placeholder="Write something..."
                      value={val.value_text ?? ''}
                      onChange={e => updateCheckin(metric.id, { value_text: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {checkinStreak > 0 && (
          <p
            className="font-ui label"
            style={{ marginTop: 24, letterSpacing: '0.15em' }}
          >
            {checkinStreak} CONSECUTIVE CHECK-INS
          </p>
        )}
      </div>

      {/* ── SECTION 3: TO-DO ──────────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-3">
        <p className="label" style={{ marginBottom: 20 }}>TO-DO</p>

        {/* Yesterday's tasks */}
        {todosYestState.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Yesterday&apos;s tasks
            </p>

            {yesterdayCollapsed ? (
              <p
                className="font-ui"
                style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setYesterdayCollapsed(false)}
              >
                Yesterday reviewed.
              </p>
            ) : (
              <div>
                {todosYestState.map((todo, i) => (
                  <div
                    key={todo.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: i < todosYestState.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span
                      className="font-display"
                      style={{ fontSize: 16, color: 'var(--accent-light)', lineHeight: 1.5, minWidth: 20 }}
                    >
                      {i + 1}
                    </span>
                    <p className="font-ui" style={{ fontSize: 14, flex: 1, lineHeight: 1.5 }}>{todo.task_text}</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {(['done', 'partial', 'not_done'] as TaskStatus[]).map(status => {
                        if (!status) return null
                        const labels: Record<string, string> = { done: 'DONE', partial: 'PARTIAL', not_done: 'NOT DONE' }
                        const sel = todo.status === status
                        return (
                          <button
                            key={status}
                            onClick={() => saveTaskStatus(todo.id, status)}
                            className="font-ui"
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: 9,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              cursor: 'pointer',
                              color: sel ? 'var(--text-primary)' : 'var(--text-muted)',
                              borderBottom: sel ? '1px solid var(--text-primary)' : '1px solid transparent',
                              padding: '2px 0',
                              transition: 'all 150ms ease',
                            }}
                          >
                            {labels[status]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {todosYestState.every(t => t.status !== null) && (
                  <button
                    onClick={() => setYesterdayCollapsed(true)}
                    className="font-ui"
                    style={{ fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  >
                    Collapse
                  </button>
                )}
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
          </div>
        )}

        {/* Tomorrow's tasks */}
        <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Tomorrow&apos;s tasks
        </p>
        <div>
          {todoInputs.map((val, i) => (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}
            >
              <span
                className="font-display"
                style={{ fontSize: 16, color: 'var(--accent-light)', lineHeight: 1.5, minWidth: 20 }}
              >
                {i + 1}
              </span>
              <input
                type="text"
                className="input-line"
                placeholder="A task for tomorrow..."
                value={val}
                onChange={e => {
                  const next = [...todoInputs]
                  next[i] = e.target.value
                  setTodoInputs(next)
                }}
                onBlur={e => saveTodoOnBlur(i, e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
          <button
            onClick={addTodo}
            className="font-ui"
            style={{ background: 'none', border: 'none', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            + ADD
          </button>
          <button
            onClick={removeTodo}
            className="font-ui"
            style={{ background: 'none', border: 'none', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            − REMOVE
          </button>
        </div>
      </div>

      {/* ── SUBMIT DAY ────────────────────────────────────────── */}
      <div
        className="section-block animate-fade-up stagger-4"
        style={{ paddingBottom: 12 }}
      >
        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="label">TODAY&apos;S ENTRY</p>
            <p
              className="font-display"
              style={{ fontSize: 20, fontWeight: 400, color: 'var(--text-primary)' }}
            >
              Day complete.
            </p>
            <p
              className="font-ui"
              style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}
            >
              You can still edit your habits, check-in and tasks above.
            </p>
          </div>
        ) : (
          <button
            onClick={handleSubmitDay}
            className="btn-primary"
            disabled={submitting}
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'SUBMITTING...' : 'SUBMIT DAY'}
          </button>
        )}
      </div>

    </main>
  )
}
