'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isSundayAfter6PM } from '@/lib/dates'

const NAV_ITEMS = [
  { label: 'TODAY',     href: '/today' },
  { label: 'REVIEW',    href: '/review' },
  { label: 'DASHBOARD', href: '/dashboard' },
  { label: 'EDIT',      href: '/edit' },
]

interface TopNavProps {
  reviewDone?: boolean
}

export default function BottomNav({ reviewDone = true }: TopNavProps) {
  const pathname = usePathname()
  const showPulse = isSundayAfter6PM() && !reviewDone

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '14px 0 12px',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map(({ label, href }) => {
        const active = pathname.startsWith(href)
        const isReview = href === '/review'
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              textDecoration: 'none',
              position: 'relative',
            }}
          >
            <span
              className="font-ui"
              style={{
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {label}
            </span>
            {active && (
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: 'var(--accent-dark)',
                  display: 'block',
                }}
              />
            )}
            {!active && isReview && showPulse && (
              <span
                className="pulse-dot"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  display: 'block',
                }}
              />
            )}
            {!active && !(isReview && showPulse) && (
              <span style={{ height: 3, width: 3 }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
