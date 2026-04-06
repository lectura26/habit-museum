'use client'

import { useState } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import type { UserMetric } from '@/lib/types/database'

interface PerHabitStat {
  id: string
  name: string
  pct: number
  streak: number
  bestStreak: number
}

interface MetricChart {
  metric: UserMetric
  data: { date: string; value: number | null }[]
}

interface DashboardClientProps {
  habitsChartData: { date: string; pct: number }[]
  perHabitStats: PerHabitStat[]
  checkinStreak: number
  metricChartData: MetricChart[]
  todosPct: number
  todosDone: number
  todosPartial: number
  todosNotDone: number
  todoChartData: { date: string; pct: number }[]
  avgSet: number
  avgDone: number
}

const TABS = ['HABITS', 'CHECK-IN', 'TO-DO'] as const
type Tab = typeof TABS[number]

export default function DashboardClient({
  habitsChartData,
  perHabitStats,
  checkinStreak,
  metricChartData,
  todosPct,
  todosDone,
  todosPartial,
  todosNotDone,
  todoChartData,
  avgSet,
  avgDone,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('HABITS')

  const overallPct = habitsChartData.length > 0
    ? Math.round(habitsChartData.reduce((sum, d) => sum + d.pct, 0) / habitsChartData.length)
    : 0

  return (
    <main className="page-content animate-fade-in" style={{ padding: '0 28px' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 28,
          padding: '24px 0 0',
          borderBottom: '1px solid var(--border)',
          marginBottom: 0,
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="font-ui"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '1.5px solid var(--text-primary)' : '1.5px solid transparent',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0 0 12px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── HABITS TAB ─────────────────────────────────────────── */}
      {activeTab === 'HABITS' && (
        <div className="animate-fade-up" style={{ paddingTop: 28 }}>
          <div
            className="font-display"
            style={{ fontSize: 80, fontWeight: 400, lineHeight: 1, color: 'var(--text-primary)', marginBottom: 8 }}
          >
            {overallPct}%
          </div>
          <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 28 }}>
            30-day average
          </p>

          <div style={{ height: 80, marginBottom: 32 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={habitsChartData}>
                <XAxis hide />
                <YAxis domain={[0, 100]} hide />
                <Line type="monotone" dataKey="pct" stroke="#3D2B1A" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            {perHabitStats.map((h, i) => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: i < perHabitStats.length - 1 ? '1px solid var(--bg-secondary)' : 'none',
                }}
              >
                <div>
                  <p className="font-ui" style={{ fontSize: 14, marginBottom: 4 }}>{h.name}</p>
                  <p className="font-ui" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Day streak: {h.streak} · Best: {h.bestStreak} days
                  </p>
                </div>
                <p
                  className="font-display"
                  style={{ fontSize: 24, color: 'var(--text-primary)' }}
                >
                  {h.pct}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CHECK-IN TAB ───────────────────────────────────────── */}
      {activeTab === 'CHECK-IN' && (
        <div className="animate-fade-up" style={{ paddingTop: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div
              className="font-display"
              style={{ fontSize: 80, fontWeight: 400, lineHeight: 1, color: 'var(--text-primary)', marginBottom: 8 }}
            >
              {checkinStreak}
            </div>
            <p className="font-ui label" style={{ letterSpacing: '0.15em' }}>CONSECUTIVE CHECK-INS</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {metricChartData.map(({ metric, data }) => {
              const hasData = data.some(d => d.value !== null)
              return (
                <div key={metric.id}>
                  <p className="label" style={{ marginBottom: 12 }}>{metric.metric_name}</p>
                  {hasData ? (
                    <div style={{ height: 60 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <XAxis hide />
                          <YAxis hide />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3D2B1A"
                            strokeWidth={1.5}
                            dot={false}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      No data yet
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TO-DO TAB ──────────────────────────────────────────── */}
      {activeTab === 'TO-DO' && (
        <div className="animate-fade-up" style={{ paddingTop: 28 }}>
          <div
            className="font-display"
            style={{ fontSize: 80, fontWeight: 400, lineHeight: 1, color: 'var(--text-primary)', marginBottom: 8 }}
          >
            {todosPct}%
          </div>
          <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 28 }}>
            overall completion
          </p>

          {/* Done / Partial / Not Done */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              marginBottom: 28,
            }}
          >
            {[
              { value: todosDone,    label: 'DONE' },
              { value: todosPartial, label: 'PARTIAL' },
              { value: todosNotDone, label: 'NOT DONE' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: '20px 0',
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                }}
              >
                <p
                  className="font-display"
                  style={{ fontSize: 32, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}
                >
                  {stat.value}
                </p>
                <p className="font-ui label" style={{ fontSize: 9 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 30-day chart */}
          <div style={{ height: 80, marginBottom: 32 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={todoChartData}>
                <XAxis hide />
                <YAxis domain={[0, 100]} hide />
                <Line type="monotone" dataKey="pct" stroke="#3D2B1A" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
            {[
              { value: avgSet.toFixed(1),  label: 'Avg set per day' },
              { value: avgDone.toFixed(1), label: 'Avg completed per day' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{ padding: '20px', background: 'var(--bg-primary)' }}
              >
                <p
                  className="font-display"
                  style={{ fontSize: 32, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}
                >
                  {stat.value}
                </p>
                <p className="font-ui" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
