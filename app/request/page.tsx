'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PackagePlus, CheckCircle } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { Navbar } from '@/app/components/Navbar'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function RequestProductPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [productName, setProductName] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth/login')
        return
      }
      setUser(data.user)
      setAuthChecked(true)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createBrowserClient()
      const { error: insertError } = await supabase.from('product_requests').insert({
        user_id: user.id,
        product_name: productName.trim(),
        product_url: productUrl.trim() || null,
        reason: reason.trim() || null,
      })
      if (insertError) {
        setError(insertError.message)
        return
      }
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar user={user} />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <PackagePlus size={18} className="text-indigo-400" />
          <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Request a Product</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Suggest a product to research</h1>
        <p className="text-gray-400 text-sm mb-8">
          Found something you think could be a winner? Tell us and we&apos;ll take a look.
        </p>

        {submitted ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-emerald-600/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={26} className="text-emerald-400" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Thanks for the suggestion!</h2>
            <p className="text-gray-400 text-sm mb-6">
              We review all requests and add the best ones to the feed within 48 hours.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setSubmitted(false); setProductName(''); setProductUrl(''); setReason('') }}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors border border-gray-700"
              >
                Submit another
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Product name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                placeholder="e.g. Retractable Dog Leash with LED Light"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AliExpress / Amazon link <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://…"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Why this product? <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Seeing it everywhere on TikTok, low competition, great margins…"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !productName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit request'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
