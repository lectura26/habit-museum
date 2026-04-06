'use client'

import { useState } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import type { WeeklyReview } from '@/lib/types/database'

interface ReviewClientProps {
  userId: string
  weekStart: string
  weekPct: number
  weekDays: string[]
  weekCheckinDots: boolean[]
  todosDone: number
  todosTotal: number
  todosPartial: number
  monthPct: number
  last30: { date: string; pct: number }[]
  bestStreak: number
  bestHabit: string
  worstHabit: string
  prediction: number
  existingReview: WeeklyReview | null
}

export default function ReviewClient({
  userId,
  weekStart,
  weekPct,
  weekDays,
  weekCheckinDots,
  todosDone,
  todosTotal,
  todosPartial,
  monthPct,
  last30,
  bestStreak,
  bestHabit,
  worstHabit,
  prediction,
  existingReview,
}: ReviewClientProps) {
  const supabase = createClient()

  const [wentWell, setWentWell]     = useState(existingReview?.went_well ?? '')
  const [focusNext, setFocusNext]   = useState(existingReview?.focus_next ?? '')
  const [goals, setGoals]           = useState<string[]>(existingReview?.goals ?? [])
  const [goalInput, setGoalInput]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  function addGoal() {
    const g = goalInput.trim()
    if (!g) return
    setGoals(prev => [...prev, g])
    setGoalInput('')
  }

  async function saveReview() {
    setSaving(true)
    await supabase.from('weekly_reviews').upsert({
      user_id:    userId,
      week_start: weekStart,
      went_well:  wentWell || null,
      focus_next: focusNext || null,
      goals,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="page-content animate-fade-in" style={{ padding: '0 28px' }}>

      {/* ── THIS WEEK ──────────────────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-1">
        <p className="label" style={{ marginBottom: 20 }}>THIS WEEK</p>

        <div
          className="font-display"
          style={{ fontSize: 80, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}
        >
          {weekPct}%
        </div>
        <p className="font-ui" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
          of habits completed this week
        </p>

        {/* 7-day check-in dots */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {weekDays.map((day, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: weekCheckinDots[i] ? 'var(--accent-dark)' : 'transparent',
                  border: weekCheckinDots[i] ? 'none' : '1.5px solid var(--border)',
                  display: 'block',
                }}
              />
              <span className="font-ui" style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {day}
              </span>
            </div>
          ))}
        </div>

        <p className="font-ui" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
          {todosDone + todosPartial} of {todosTotal} to-dos completed
        </p>

        {/* Weekly goals */}
        <div style={{ marginBottom: 28 }}>
          <p className="label" style={{ marginBottom: 12 }}>WEEKLY GOALS</p>
          {goals.map((g, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span className="font-ui" style={{ fontSize: 14, flex: 1 }}>{g}</span>
              <button
                onClick={() => setGoals(prev => prev.filter((_, j) => j !== i))}
                className="font-ui"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 0, marginTop: 12 }}>
            <input
              type="text"
              className="input-line"
              placeholder="Add a goal..."
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGoal() } }}
              style={{ flex: 1 }}
            />
            <button
              onClick={addGoal}
              className="font-ui"
              style={{
                background: 'var(--accent-dark)',
                color: 'var(--bg-primary)',
                border: 'none',
                padding: '0 14px',
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Reflections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 32 }}>
          <div>
            <p className="label" style={{ marginBottom: 12 }}>WHAT WENT WELL</p>
            <textarea
              className="textarea-line"
              placeholder="Write something..."
              value={wentWell}
              onChange={e => setWentWell(e.target.value)}
            />
          </div>
          <div>
            <p className="label" style={{ marginBottom: 12 }}>FOCUS NEXT WEEK</p>
            <textarea
              className="textarea-line"
              placeholder="Write something..."
              value={focusNext}
              onChange={e => setFocusNext(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={saveReview}
          className="btn-primary"
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saved ? 'SAVED' : saving ? 'SAVING...' : 'SAVE REVIEW'}
        </button>
      </div>

      {/* ── THIS MONTH ─────────────────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-2">
        <p className="label" style={{ marginBottom: 20 }}>THIS MONTH</p>

        <div
          className="font-display"
          style={{ fontSize: 80, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 32 }}
        >
          {monthPct}%
        </div>

        {/* 30-day line chart */}
        <div style={{ height: 80, marginBottom: 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last30}>
              <XAxis hide />
              <YAxis domain={[0, 100]} hide />
              <Line
                type="monotone"
                dataKey="pct"
                stroke="#3D2B1A"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Three stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px solid var(--border)',
          }}
        >
          {[
            { value: String(bestStreak), label: 'Best streak (days)' },
            { value: bestHabit,          label: 'Most completed' },
            { value: worstHabit,         label: 'Least completed' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '20px 0',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                paddingLeft: i > 0 ? 16 : 0,
              }}
            >
              <p
                className="font-display"
                style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 6, wordBreak: 'break-word' }}
              >
                {stat.value}
              </p>
              <p className="font-ui" style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {prediction > 0 && (
          <p className="font-ui" style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 24, lineHeight: 1.7 }}>
            At this rate you will be {prediction}% better in 90 days.
          </p>
        )}
      </div>

    </main>
  )
}
