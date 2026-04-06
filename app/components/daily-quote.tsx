import { getDailyQuote } from '@/lib/quotes'
import { toLocalDateString } from '@/lib/dates'

export default async function DailyQuote() {
  let quote = null
  try {
    const today = toLocalDateString()
    quote = await getDailyQuote(today)
  } catch {
    // stoic_quotes table may not exist yet — fail silently
    return null
  }

  if (!quote) return null

  return (
    <div
      style={{
        padding: '16px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-primary)',
      }}
    >
      <p
        className="label"
        style={{ marginBottom: 8 }}
      >
        DAILY REFLECTION
      </p>
      <p
        className="font-display"
        style={{
          fontSize: 16,
          fontWeight: 400,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: 8,
        }}
      >
        {quote.quote}
      </p>
      <p
        className="font-ui"
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--accent-light)',
        }}
      >
        — {quote.author}
      </p>
    </div>
  )
}
