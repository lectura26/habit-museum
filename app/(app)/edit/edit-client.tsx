'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Habit, UserMetric, MetricType } from '@/lib/types/database'
import { DEFAULT_EMOTIONS } from '@/lib/types/database'

interface EditClientProps {
  userId: string
  habits: Habit[]
  metrics: UserMetric[]
  defaultTodoCount: number
  weeklyGoals: string[]
  weekStart: string
}

const METRIC_TYPE_LABELS: Record<MetricType, string> = {
  yes_no:    'YES/NO',
  score_10:  '1–10',
  score_100: '1–100',
  number:    'NUMBER',
  emotions:  'EMOTIONS',
  freetext:  'FREETEXT',
}

const METRIC_TYPES = Object.entries(METRIC_TYPE_LABELS) as [MetricType, string][]

export default function EditClient({
  userId,
  habits: initialHabits,
  metrics: initialMetrics,
  defaultTodoCount: initialDefaultTodo,
  weeklyGoals: initialGoals,
  weekStart,
}: EditClientProps) {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const [writeError, setWriteError] = useState<string | null>(null)

  async function checked(promise: PromiseLike<{ error: { message: string } | null }>) {
    const result = await promise
    if (result.error) setWriteError(result.error.message)
    else setWriteError(null)
  }

  // ─── Habits state ───────────────────────────────────────────
  const [habits, setHabits]           = useState<Habit[]>(initialHabits)
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [editingHabitName, setEditingHabitName] = useState('')
  const [newHabitName, setNewHabitName] = useState('')
  const [habitAdding, setHabitAdding] = useState(false)
  const [habitError, setHabitError]   = useState<string | null>(null)

  async function saveHabitName(id: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name: trimmed } : h))
    setEditingHabitId(null)
    await checked(supabase.from('habits').update({ name: trimmed }).eq('id', id))
  }

  async function toggleHabitActive(id: string, is_active: boolean) {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, is_active } : h))
    await checked(supabase.from('habits').update({ is_active }).eq('id', id))
  }

  async function deleteHabit(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id))
    await checked(supabase.from('habits').delete().eq('id', id))
  }

  async function addHabit() {
    const name = newHabitName.trim()
    if (!name || habitAdding) return
    setHabitAdding(true)
    setHabitError(null)

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name,
        is_active: true,
        display_order: habits.length,
        category: null,
      })
      .select()
      .single()

    if (error) {
      setHabitError(error.message)
      setWriteError(error.message)
    } else if (data) {
      setHabits(prev => [...prev, data])
      setNewHabitName('')
    }
    setHabitAdding(false)
  }

  // ─── Metrics state ──────────────────────────────────────────
  const [metrics, setMetrics]         = useState<UserMetric[]>(initialMetrics)
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null)
  const [editingMetricName, setEditingMetricName] = useState('')
  const [expandedEmotionId, setExpandedEmotionId] = useState<string | null>(null)
  const [newEmotionInputs, setNewEmotionInputs] = useState<Record<string, string>>({})
  const [showAddMetric, setShowAddMetric] = useState(false)
  const [newMetricName, setNewMetricName] = useState('')
  const [newMetricType, setNewMetricType] = useState<MetricType>('score_10')
  const [newMetricUnit, setNewMetricUnit] = useState('')

  async function saveMetricName(id: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, metric_name: trimmed } : m))
    setEditingMetricId(null)
    await checked(supabase.from('user_metrics').update({ metric_name: trimmed }).eq('id', id))
  }

  async function toggleMetricActive(id: string, is_active: boolean) {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, is_active } : m))
    await checked(supabase.from('user_metrics').update({ is_active }).eq('id', id))
  }

  async function deleteMetric(id: string) {
    setMetrics(prev => prev.filter(m => m.id !== id))
    await checked(supabase.from('user_metrics').delete().eq('id', id))
  }

  async function addMetric() {
    const name = newMetricName.trim()
    if (!name) return
    const order = metrics.length
    const { data, error } = await supabase
      .from('user_metrics')
      .insert({
        user_id:      userId,
        metric_name:  name,
        metric_type:  newMetricType,
        unit:         newMetricType === 'number' ? newMetricUnit || null : null,
        is_active:    true,
        display_order: order,
        emotion_options: newMetricType === 'emotions' ? [...DEFAULT_EMOTIONS] : null,
      })
      .select()
      .single()
    if (error) {
      setWriteError(error.message)
    } else if (data) {
      setMetrics(prev => [...prev, data])
    }
    setNewMetricName('')
    setNewMetricUnit('')
    setShowAddMetric(false)
  }

  async function addEmotion(metricId: string) {
    const word = (newEmotionInputs[metricId] ?? '').trim()
    if (!word) return
    const metric = metrics.find(m => m.id === metricId)
    if (!metric) return
    const updated = [...(metric.emotion_options ?? []), word]
    setMetrics(prev => prev.map(m => m.id === metricId ? { ...m, emotion_options: updated } : m))
    setNewEmotionInputs(prev => ({ ...prev, [metricId]: '' }))
    await checked(supabase.from('user_metrics').update({ emotion_options: updated }).eq('id', metricId))
  }

  async function removeEmotion(metricId: string, word: string) {
    const metric = metrics.find(m => m.id === metricId)
    if (!metric) return
    const updated = (metric.emotion_options ?? []).filter(e => e !== word)
    setMetrics(prev => prev.map(m => m.id === metricId ? { ...m, emotion_options: updated } : m))
    await checked(supabase.from('user_metrics').update({ emotion_options: updated }).eq('id', metricId))
  }

  // ─── Default to-do count ────────────────────────────────────
  const [defaultTodo, setDefaultTodo] = useState(initialDefaultTodo)

  async function updateDefaultTodo(val: number) {
    setDefaultTodo(val)
    await checked(supabase.from('profiles').update({ default_todo_count: val }).eq('user_id', userId))
  }

  // ─── Weekly goals ───────────────────────────────────────────
  const [goals, setGoals] = useState<string[]>(initialGoals)
  const [goalInput, setGoalInput] = useState('')

  async function addGoal() {
    const g = goalInput.trim()
    if (!g) return
    const updated = [...goals, g]
    setGoals(updated)
    setGoalInput('')
    await checked(supabase.from('weekly_reviews').upsert({ user_id: userId, week_start: weekStart, goals: updated }))
  }

  async function removeGoal(i: number) {
    const updated = goals.filter((_, j) => j !== i)
    setGoals(updated)
    await checked(supabase.from('weekly_reviews').upsert({ user_id: userId, week_start: weekStart, goals: updated }))
  }

  function activeToggle(isActive: boolean, onToggle: (val: boolean) => void) {
    return (
      <div style={{ display: 'flex', gap: 12 }}>
        {(['ACTIVE', 'PAUSED'] as const).map(opt => {
          const val = opt === 'ACTIVE'
          const sel = isActive === val
          return (
            <button
              key={opt}
              onClick={() => onToggle(val)}
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
              {opt}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <main className="page-content animate-fade-in" style={{ padding: '0 28px' }}>

      {writeError && (
        <div style={{ padding: '12px 0', marginBottom: 8 }}>
          <p className="font-ui" style={{ fontSize: 11, color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.6 }}>
            ERROR: {writeError}
          </p>
        </div>
      )}

      {/* ── YOUR HABITS ───────────────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-1">
        <p className="label" style={{ marginBottom: 20 }}>YOUR HABITS</p>

        {habits.map((habit, i) => (
          <div
            key={habit.id}
            style={{
              padding: '14px 0',
              borderBottom: i < habits.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              {editingHabitId === habit.id ? (
                <input
                  autoFocus
                  className="input-line"
                  style={{ flex: 1, fontSize: 14 }}
                  value={editingHabitName}
                  onChange={e => setEditingHabitName(e.target.value)}
                  onBlur={() => saveHabitName(habit.id, editingHabitName)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') saveHabitName(habit.id, editingHabitName)
                    if (e.key === 'Escape') setEditingHabitId(null)
                  }}
                />
              ) : (
                <p
                  className="font-ui"
                  style={{ fontSize: 14, flex: 1, cursor: 'text' }}
                  onClick={() => { setEditingHabitId(habit.id); setEditingHabitName(habit.name) }}
                >
                  {habit.name}
                </p>
              )}
              <button
                onClick={() => deleteHabit(habit.id)}
                className="font-ui"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            {activeToggle(habit.is_active, val => toggleHabitActive(habit.id, val))}
          </div>
        ))}

        {/* Add new habit */}
        <div style={{ display: 'flex', gap: 0, marginTop: 20 }}>
          <input
            type="text"
            className="input-line"
            placeholder="New habit name..."
            value={newHabitName}
            onChange={e => { setNewHabitName(e.target.value); setHabitError(null) }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') { e.preventDefault(); addHabit() }
            }}
            style={{ flex: 1 }}
            disabled={habitAdding}
          />
          <button
            onClick={addHabit}
            className="font-ui"
            disabled={habitAdding}
            style={{
              background: 'var(--accent-dark)',
              color: 'var(--bg-primary)',
              border: 'none',
              padding: '0 14px',
              fontSize: 20,
              cursor: habitAdding ? 'not-allowed' : 'pointer',
              opacity: habitAdding ? 0.5 : 1,
              transition: 'opacity 150ms ease',
            }}
          >
            {habitAdding ? '…' : '+'}
          </button>
        </div>

        {habitError && (
          <p
            className="font-ui"
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginTop: 10,
              lineHeight: 1.6,
            }}
          >
            {habitError}
          </p>
        )}
      </div>

      {/* ── YOUR CHECK-IN ─────────────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-2">
        <p className="label" style={{ marginBottom: 20 }}>YOUR CHECK-IN</p>

        {metrics.map((metric, i) => (
          <div
            key={metric.id}
            style={{
              padding: '14px 0',
              borderBottom: i < metrics.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              {editingMetricId === metric.id ? (
                <input
                  autoFocus
                  className="input-line"
                  style={{ flex: 1, fontSize: 14 }}
                  value={editingMetricName}
                  onChange={e => setEditingMetricName(e.target.value)}
                  onBlur={() => saveMetricName(metric.id, editingMetricName)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') saveMetricName(metric.id, editingMetricName)
                    if (e.key === 'Escape') setEditingMetricId(null)
                  }}
                />
              ) : (
                <p
                  className="font-ui"
                  style={{ fontSize: 14, flex: 1, cursor: 'text' }}
                  onClick={() => { setEditingMetricId(metric.id); setEditingMetricName(metric.metric_name) }}
                >
                  {metric.metric_name}
                </p>
              )}
              <span
                className="font-ui"
                style={{
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  padding: '3px 8px',
                  flexShrink: 0,
                }}
              >
                {METRIC_TYPE_LABELS[metric.metric_type]}
              </span>
              <button
                onClick={() => deleteMetric(metric.id)}
                className="font-ui"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            {activeToggle(metric.is_active, val => toggleMetricActive(metric.id, val))}

            {/* Emotions expansion */}
            {metric.metric_type === 'emotions' && (
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => setExpandedEmotionId(expandedEmotionId === metric.id ? null : metric.id)}
                  className="font-ui label"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: 'var(--text-muted)' }}
                >
                  {expandedEmotionId === metric.id ? 'HIDE' : 'EDIT EMOTIONS'}
                </button>
                {expandedEmotionId === metric.id && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {(metric.emotion_options ?? []).map(word => (
                        <span
                          key={word}
                          className="font-ui"
                          style={{
                            fontSize: 11,
                            textTransform: 'uppercase',
                            border: '1px solid var(--border)',
                            padding: '4px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {word}
                          <button
                            onClick={() => removeEmotion(metric.id, word)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 0, lineHeight: 1 }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 0 }}>
                      <input
                        type="text"
                        className="input-line"
                        placeholder="Add emotion..."
                        value={newEmotionInputs[metric.id] ?? ''}
                        onChange={e => setNewEmotionInputs(prev => ({ ...prev, [metric.id]: e.target.value }))}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') { e.preventDefault(); addEmotion(metric.id) }
                        }}
                        style={{ flex: 1, fontSize: 12 }}
                      />
                      <button
                        onClick={() => addEmotion(metric.id)}
                        className="font-ui"
                        style={{ background: 'var(--accent-dark)', color: 'var(--bg-primary)', border: 'none', padding: '0 12px', fontSize: 18, cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add metric */}
        {showAddMetric ? (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
              <input
                autoFocus
                type="text"
                className="input-line"
                placeholder="Check-in name..."
                value={newMetricName}
                onChange={e => setNewMetricName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                onClick={addMetric}
                className="font-ui"
                style={{ background: 'var(--accent-dark)', color: 'var(--bg-primary)', border: 'none', padding: '0 14px', fontSize: 16, cursor: 'pointer' }}
              >
                ADD
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginBottom: 12 }}>
              {METRIC_TYPES.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setNewMetricType(key)}
                  className="font-ui"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    cursor: 'pointer',
                    color: newMetricType === key ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: newMetricType === key ? '1px solid var(--text-primary)' : '1px solid transparent',
                    padding: '4px 0',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {newMetricType === 'number' && (
              <input
                type="text"
                className="input-line"
                placeholder="Unit (e.g. kg)"
                value={newMetricUnit}
                onChange={e => setNewMetricUnit(e.target.value)}
                style={{ marginBottom: 12 }}
              />
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAddMetric(true)}
            className="font-ui label"
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 20, color: 'var(--text-muted)', textAlign: 'left' }}
          >
            + ADD CHECK-IN
          </button>
        )}
      </div>

      {/* ── YOUR TO-DO ────────────────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-3">
        <p className="label" style={{ marginBottom: 20 }}>YOUR TO-DO</p>
        <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
          Default daily tasks:
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, justifyContent: 'center' }}>
          <button
            onClick={() => updateDefaultTodo(Math.max(1, defaultTodo - 1))}
            className="font-ui"
            style={{ background: 'none', border: 'none', fontSize: 28, color: 'var(--accent-dark)', cursor: 'pointer' }}
          >
            −
          </button>
          <span
            className="font-display"
            style={{ fontSize: 64, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1, minWidth: '2ch', textAlign: 'center' }}
          >
            {defaultTodo}
          </span>
          <button
            onClick={() => updateDefaultTodo(Math.min(10, defaultTodo + 1))}
            className="font-ui"
            style={{ background: 'none', border: 'none', fontSize: 28, color: 'var(--accent-dark)', cursor: 'pointer' }}
          >
            +
          </button>
        </div>
        <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
          You can adjust this any day.
        </p>
      </div>

      {/* ── YOUR WEEKLY GOALS ─────────────────────────────────── */}
      <div className="section-block animate-fade-up stagger-4">
        <p className="label" style={{ marginBottom: 20 }}>YOUR WEEKLY GOALS</p>

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
              onClick={() => removeGoal(i)}
              className="font-ui"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 0, marginTop: 16 }}>
          <input
            type="text"
            className="input-line"
            placeholder="Add a goal..."
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') { e.preventDefault(); addGoal() }
            }}
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
        <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          Weekly goals reset every Monday.
        </p>
      </div>

    </main>
  )
}
