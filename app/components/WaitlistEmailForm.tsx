'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

export function WaitlistEmailForm({ source, className }: { source: string; className?: string }) {
  const [email, setEmail] = useState('')
  const [ref, setRef] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ position?: number; alreadySubscribed?: boolean } | null>(null)

  // Read straight from window.location instead of useSearchParams() so this
  // component doesn't force a Suspense boundary on the page.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('ref')
    if (code) Promise.resolve().then(() => setRef(code))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source, ref: ref ?? undefined }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error === 'invalid_email' ? 'Please enter a valid email address.' : 'Something went wrong. Please try again.')
        return
      }
      setResult(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className={`flex items-center gap-3 bg-emerald-600/10 border border-emerald-500/30 rounded-xl px-5 py-4 ${className ?? ''}`}>
        <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center shrink-0">
          <Check size={16} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">
            {result.alreadySubscribed ? "You're already on the list!" : "You're in!"}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {typeof result.position === 'number' ? `You're #${result.position} on the waitlist. ` : ''}Check your email to confirm.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-base"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl transition-colors shrink-0"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Join the Waitlist
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </form>
  )
}
