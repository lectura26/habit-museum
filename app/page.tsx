import Link from 'next/link'

const FEATURES = [
  {
    num: '01',
    title: 'THE DAILY PRACTICE',
    body: 'Track your habits. Record your state. Write tomorrow\'s to-dos before the day ends. It takes three minutes.',
  },
  {
    num: '02',
    title: 'CHECK-IN',
    body: 'Every evening you record what matters. Sleep. Energy. Mood. Weight. You decide what belongs in your museum. The data builds quietly.',
  },
  {
    num: '03',
    title: 'TO-DO',
    body: 'Write between one and ten tasks for tomorrow. Review them the next evening. Over weeks you see the gap between what you plan and what you do.',
  },
  {
    num: '04',
    title: 'REVIEW',
    body: 'Every Sunday a weekly review waits. Every month a longer view. Not to judge. To observe.',
  },
  {
    num: '05',
    title: 'DASHBOARD',
    body: 'Your data becomes a portrait. Mood over thirty days. Habit completion over a month. One percent better, compounding.',
  },
  {
    num: '06',
    title: 'YOURS ALONE',
    body: 'No social features. No leaderboards. No anxiety-inducing notifications. Habit Museum is a private space.',
  },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      {/* Top navigation */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 28px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-primary)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <span
          className="font-display"
          style={{ fontSize: 16, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-primary)' }}
        >
          HABIT MUSEUM
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link
            href="/login"
            className="font-ui"
            style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            LOGIN
          </Link>
          <Link
            href="/signup"
            className="font-ui"
            style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            SIGN UP
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="animate-fade-in"
        style={{
          minHeight: 'calc(100dvh - 61px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 28px',
          background: 'var(--bg-primary)',
        }}
      >
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(56px, 14vw, 96px)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 20,
          }}
        >
          HABIT<br />MUSEUM
        </h1>
        <p
          className="font-ui label"
          style={{ marginBottom: 32 }}
        >
          A PRIVATE MUSEUM OF PERSONAL DISCIPLINE
        </p>
        <div style={{ width: 120, height: 1, background: 'var(--border)', marginBottom: 40 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          <Link href="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none' }}>
            ENTER
          </Link>
          <Link href="/signup" className="btn-secondary" style={{ display: 'block', textDecoration: 'none' }}>
            CREATE ACCOUNT
          </Link>
        </div>
      </section>

      {/* Feature sections */}
      {FEATURES.map((f, i) => (
        <section
          key={f.num}
          className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}
          style={{
            borderTop: '1px solid var(--border)',
            padding: '100px 28px',
            background: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
          }}
        >
          <span
            className="font-display"
            style={{ fontSize: 20, color: 'var(--accent-light)', display: 'block', marginBottom: 12 }}
          >
            {f.num}
          </span>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(32px, 8vw, 48px)',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              lineHeight: 1,
              color: 'var(--text-primary)',
              marginBottom: 24,
            }}
          >
            {f.title}
          </h2>
          <p
            className="font-ui"
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: 'var(--text-primary)',
              maxWidth: 380,
            }}
          >
            {f.body}
          </p>
        </section>
      ))}

      {/* Closing quote */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          padding: '100px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <blockquote
          className="font-display"
          style={{
            fontSize: 'clamp(24px, 6vw, 40px)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          WE ARE WHAT WE REPEATEDLY DO
        </blockquote>
        <p
          className="font-ui label"
          style={{ marginBottom: 60 }}
        >
          — ARISTOTLE
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          <Link href="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none' }}>
            ENTER
          </Link>
          <Link href="/signup" className="btn-secondary" style={{ display: 'block', textDecoration: 'none' }}>
            CREATE ACCOUNT
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '28px',
          textAlign: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <p className="font-ui label">HABIT MUSEUM · A PRIVATE PRACTICE</p>
      </footer>
    </div>
  )
}
