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

interface BottomNavProps {
  reviewDone?: boolean
}

export default function BottomNav({ reviewDone = true }: BottomNavProps) {
  const pathname = usePathname()
  const showPulse = isSundayAfter6PM() && !reviewDone

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '12px 0 20px',
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
              gap: 6,
              textDecoration: 'none',
              position: 'relative',
            }}
          >
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
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  display: 'block',
                }}
              />
            )}
            {!active && !(isReview && showPulse) && (
              <span style={{ height: 3, width: 3 }} />
            )}
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
          </Link>
        )
      })}
    </nav>
  )
}
