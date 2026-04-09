'use client'

import { useState, KeyboardEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MetricType, Language } from '@/lib/types/database'
import { DEFAULT_EMOTIONS } from '@/lib/types/database'

type Step = 1 | 2 | 3 | 4

interface NewHabit {
  name: string
}

interface NewMetric {
  name: string
  type: MetricType
  unit?: string
  emotionOptions?: string[]
}

const METRIC_TYPES: { key: MetricType; label: string }[] = [
  { key: 'yes_no',    label: 'YES/NO' },
  { key: 'score_10',  label: '1–10' },
  { key: 'score_100', label: '1–100' },
  { key: 'number',    label: 'NUMBER' },
  { key: 'emotions',  label: 'EMOTIONS' },
  { key: 'freetext',  label: 'FREE TEXT' },
]

const i18n: Record<Language, Record<string, string>> = {
  en: {
    selectLang: 'SELECT LANGUAGE',
    english: 'ENGLISH',
    danish: 'DANSK',
    begin: 'BEGIN',
    welcome: 'HABIT MUSEUM',
    sub: "Let's build your museum.",
    yourHabits: 'YOUR HABITS',
    addPlaceholder: 'Add a habit...',
    continue: 'CONTINUE',
    checkIn: 'YOUR CHECK-IN',
    checkInSub: 'Name your check-ins and choose how to measure them.',
    checkInPlaceholder: 'Check-in name...',
    add: 'ADD',
    yourTodo: 'YOUR TO-DO',
    todoSub: 'Each evening you write tasks for tomorrow. How many do you want by default?',
    adjustNote: 'You can adjust this any day.',
    finish: 'FINISH SETUP',
  },
  da: {
    selectLang: 'VÆLG SPROG',
    english: 'ENGLISH',
    danish: 'DANSK',
    begin: 'BEGYND',
    welcome: 'HABIT MUSEUM',
    sub: 'Lad os bygge dit museum.',
    yourHabits: 'DINE VANER',
    addPlaceholder: 'Tilføj en vane...',
    continue: 'FORTSÆT',
    checkIn: 'DIT CHECK-IN',
    checkInSub: 'Navngiv dine check-ins og vælg hvordan de måles.',
    checkInPlaceholder: 'Check-in navn...',
    add: 'TILFØJ',
    yourTodo: 'DIN TO-DO',
    todoSub: 'Hver aften skriver du opgaver til i morgen. Hvor mange vil du have som standard?',
    adjustNote: 'Du kan justere det på dagen.',
    finish: 'AFSLUT OPSÆTNING',
  },
}

export default function OnboardingPage() {
  const [step, setStep]         = useState<Step>(1)
  const [lang, setLang]         = useState<Language>('en')
  const [habits, setHabits]     = useState<NewHabit[]>([])
  const [habitInput, setHabitInput] = useState('')
  const [metrics, setMetrics]   = useState<NewMetric[]>([])
  const [metricName, setMetricName]   = useState('')
  const [metricType, setMetricType]   = useState<MetricType>('score_10')
  const [metricUnit, setMetricUnit]   = useState('')
  const [todoCount, setTodoCount]     = useState(3)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const t = i18n[lang]

  function addHabit() {
    const name = habitInput.trim()
    if (!name || habits.some(h => h.name === name)) return
    setHabits(prev => [...prev, { name }])
    setHabitInput('')
  }

  function addMetric() {
    const name = metricName.trim()
    if (!name) return
    setMetrics(prev => [...prev, {
      name,
      type: metricType,
      unit: metricType === 'number' ? metricUnit : undefined,
      emotionOptions: metricType === 'emotions' ? [...DEFAULT_EMOTIONS] : undefined,
    }])
    setMetricName('')
    setMetricUnit('')
  }

  function handleHabitKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addHabit() }
  }

  function handleMetricKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addMetric() }
  }

  async function handleFinish() {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      // Use getSession() (reads local storage) instead of getUser() (makes a
      // network round-trip) so this works reliably right after OAuth redirect.
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) { window.location.href = '/login'; return }

      // Upsert profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        user_id: user.id,
        full_name: user.user_metadata?.full_name ?? null,
        language: lang,
        default_todo_count: todoCount,
      })
      if (profileError) throw new Error(`Profile: ${profileError.message}`)

      // Insert habits — category column is nullable after the align migration.
      // Passing category: null explicitly avoids a not-null violation on older schemas.
      if (habits.length > 0) {
        const { error: habitError } = await supabase.from('habits').insert(
          habits.map((h, i) => ({
            user_id: user.id,
            name: h.name,
            is_active: true,
            display_order: i,
            category: null,
          }))
        )
        if (habitError) throw new Error(`Habits: ${habitError.message}`)
      }

      // Insert metrics
      if (metrics.length > 0) {
        const { error: metricError } = await supabase.from('user_metrics').insert(
          metrics.map((m, i) => ({
            user_id:      user.id,
            metric_name:  m.name,
            metric_type:  m.type,
            unit:         m.unit ?? null,
            is_active:    true,
            display_order: i,
            emotion_options: m.emotionOptions ?? null,
          }))
        )
        if (metricError) throw new Error(`Check-ins: ${metricError.message}`)
      }

      window.location.href = '/today'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const stepDots = [1, 2, 3, 4] as const

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 28px 40px',
      }}
    >
      {/* Step dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
        {stepDots.map(n => (
          <span
            key={n}
            style={{
              width:  n === step ? 10 : 6,
              height: n === step ? 10 : 6,
              borderRadius: '50%',
              background: n === step ? 'var(--accent-dark)' : 'var(--border)',
              display: 'inline-block',
              transition: 'all 300ms ease',
            }}
          />
        ))}
      </div>

      {/* ── STEP 1 — Welcome / Language ── */}
      {step === 1 && (
        <div
          className="animate-fade-up"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 32 }}
        >
          {/* Language selector */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 8 }}>
            {(['en', 'da'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="font-ui"
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: lang === l ? '2px solid var(--accent-dark)' : '2px solid transparent',
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: lang === l ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px 0',
                  transition: 'all 200ms ease',
                }}
              >
                {l === 'en' ? t.english : t.danish}
              </button>
            ))}
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: 56,
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
            }}
          >
            {t.welcome}
          </h1>
          <p className="font-ui" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {t.sub}
          </p>

          <button onClick={() => setStep(2)} className="btn-primary" style={{ width: '100%', maxWidth: 320, marginTop: 16 }}>
            {t.begin}
          </button>
        </div>
      )}

      {/* ── STEP 2 — Habits ── */}
      {step === 2 && (
        <div className="animate-fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <p className="label">{t.yourHabits}</p>

          <div style={{ display: 'flex', gap: 0 }}>
            <input
              type="text"
              className="input-line"
              placeholder={t.addPlaceholder}
              value={habitInput}
              onChange={e => setHabitInput(e.target.value)}
              onKeyDown={handleHabitKeyDown}
              style={{ flex: 1 }}
            />
            <button
              onClick={addHabit}
              className="font-ui"
              style={{
                background: 'var(--accent-dark)',
                color: 'var(--bg-primary)',
                border: 'none',
                padding: '0 16px',
                fontSize: 20,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              +
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {habits.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span className="font-ui" style={{ fontSize: 14 }}>{h.name}</span>
                <button
                  onClick={() => setHabits(prev => prev.filter((_, j) => j !== i))}
                  className="font-ui"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => setStep(3)} className="btn-primary">
            {t.continue}
          </button>
        </div>
      )}

      {/* ── STEP 3 — Check-In ── */}
      {step === 3 && (
        <div className="animate-fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p className="label">{t.checkIn}</p>
          <p className="font-ui" style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {t.checkInSub}
          </p>

          {/* Add metric form */}
          <div style={{ display: 'flex', gap: 0 }}>
            <input
              type="text"
              className="input-line"
              placeholder={t.checkInPlaceholder}
              value={metricName}
              onChange={e => setMetricName(e.target.value)}
              onKeyDown={handleMetricKeyDown}
              style={{ flex: 1 }}
            />
            <button
              onClick={addMetric}
              className="font-ui"
              style={{
                background: 'var(--accent-dark)',
                color: 'var(--bg-primary)',
                border: 'none',
                padding: '0 16px',
                fontSize: 20,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              +
            </button>
          </div>

          {/* Type selector */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            {METRIC_TYPES.map(m => (
              <button
                key={m.key}
                onClick={() => setMetricType(m.key)}
                className="font-ui"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  color: metricType === m.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: metricType === m.key ? '1px solid var(--text-primary)' : '1px solid transparent',
                  padding: '4px 0',
                  transition: 'all 150ms ease',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {metricType === 'number' && (
            <input
              type="text"
              className="input-line"
              placeholder="Unit (e.g. kg, steps)"
              value={metricUnit}
              onChange={e => setMetricUnit(e.target.value)}
            />
          )}

          {/* Metric list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {metrics.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <p className="font-ui" style={{ fontSize: 14, marginBottom: 2 }}>{m.name}</p>
                  <p className="font-ui label" style={{ fontSize: 9 }}>
                    {METRIC_TYPES.find(x => x.key === m.type)?.label}
                    {m.unit ? ` · ${m.unit}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setMetrics(prev => prev.filter((_, j) => j !== i))}
                  className="font-ui"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => setStep(4)} className="btn-primary">
            {t.continue}
          </button>
        </div>
      )}

      {/* ── STEP 4 — To-Do default count ── */}
      {step === 4 && (
        <div
          className="animate-fade-up"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32 }}
        >
          <p className="label">{t.yourTodo}</p>
          <p
            className="font-ui"
            style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7, maxWidth: 280 }}
          >
            {t.todoSub}
          </p>

          {/* Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <button
              onClick={() => setTodoCount(c => Math.max(1, c - 1))}
              className="font-ui"
              style={{ background: 'none', border: 'none', fontSize: 28, color: 'var(--accent-dark)', cursor: 'pointer', padding: 8 }}
            >
              −
            </button>
            <span
              className="font-display"
              style={{ fontSize: 80, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1, minWidth: '2ch', textAlign: 'center' }}
            >
              {todoCount}
            </span>
            <button
              onClick={() => setTodoCount(c => Math.min(10, c + 1))}
              className="font-ui"
              style={{ background: 'none', border: 'none', fontSize: 28, color: 'var(--accent-dark)', cursor: 'pointer', padding: 8 }}
            >
              +
            </button>
          </div>

          <p className="font-ui label" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t.adjustNote}
          </p>

          {error && (
            <p
              className="font-ui"
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                textAlign: 'center',
                maxWidth: 320,
                lineHeight: 1.6,
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleFinish}
            className="btn-primary"
            disabled={saving}
            style={{ opacity: saving ? 0.6 : 1, width: '100%', maxWidth: 320 }}
          >
            {saving ? 'SAVING...' : t.finish}
          </button>
        </div>
      )}
    </div>
  )
}
