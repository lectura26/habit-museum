'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        padding: '60px 28px',
        background: 'var(--bg-primary)',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <p className="label" style={{ marginBottom: 12 }}>ERROR</p>
      <p
        className="font-display"
        style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}
      >
        Something went wrong.
      </p>
      <p className="font-ui" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button onClick={reset} className="btn-primary" style={{ maxWidth: 200 }}>
        TRY AGAIN
      </button>
    </div>
  )
}
