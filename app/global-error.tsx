'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled root-level error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: '#030712', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>
            Launchory hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ background: '#4f46e5', color: 'white', fontSize: 14, fontWeight: 600, padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
