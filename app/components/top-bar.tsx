'use client'

import { useEffect, useState } from 'react'
import { formatDate, getGreeting } from '@/lib/dates'

interface TopBarProps {
  firstName?: string
  streak?: number
}

export default function TopBar({ firstName = '', streak = 0 }: TopBarProps) {
  const [dateStr, setDateStr] = useState(() => formatDate())
  const [greeting, setGreeting] = useState(() => getGreeting(firstName))

  useEffect(() => {
    const id = setInterval(() => {
      setDateStr(formatDate())
      setGreeting(getGreeting(firstName))
    }, 60_000)
    return () => clearInterval(id)
  }, [firstName])

  return (
    <header
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 28px 14px',
      }}
    >
      <p className="label" style={{ marginBottom: 4 }}>{dateStr}</p>
      <p
        className="font-display"
        style={{
          fontSize: 24,
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: 8,
        }}
      >
        {greeting}
      </p>
      {streak > 0 && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-secondary)',
            border: '1px solid #D4C4A8',
            borderRadius: 20,
            padding: '4px 14px',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            className="font-ui"
            style={{ fontSize: 11, color: 'var(--text-primary)', letterSpacing: '0.1em' }}
          >
            Day {streak} streak
          </span>
        </div>
      )}
    </header>
  )
}
