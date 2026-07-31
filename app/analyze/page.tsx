'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap, Lock, AlertCircle, DollarSign, Target, Megaphone } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { AppLayout } from '@/app/components/AppLayout'
import { AnalysisResultView } from '@/app/components/AnalysisResultView'
import type { AnalysisResult } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function AnalyzePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [productUrl, setProductUrl] = useState('')
  const [productTitle, setProductTitle] = useState('')
  const [paramsRead, setParamsRead] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Read the extension-provided url/title from the query string on mount —
  // matches this codebase's convention of reading window.location.search
  // directly rather than useSearchParams, to avoid a Suspense boundary.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlParam = params.get('url') ?? ''
    const titleParam = params.get('title') ?? ''
    console.log('[Launchory /analyze] params received:', {
      search: window.location.search,
      url: urlParam,
      title: titleParam,
    })
    Promise.resolve().then(() => {
      setProductUrl(urlParam)
      setProductTitle(titleParam)
      setParamsRead(true)
    })
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setAuthChecked(true)
    })
  }, [])

  async function handleAnalyze() {
    if (!productTitle) return
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productTitle,
          description: `Product sourced from AliExpress via the Launchory Chrome extension.${productUrl ? ` URL: ${productUrl}` : ''}`,
          niche: '',
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(
          data?.error === 'limit_reached'
            ? "You've used all your free analyses this month. Upgrade to Pro for unlimited AI analyses."
            : 'Analysis failed. Please try again.'
        )
        return
      }
      setResult(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  // Auto-start the analysis for logged-in users as soon as we know who
  // they are and what product was passed in — the whole point of the
  // extension flow is that it feels instant, not another click.
  useEffect(() => {
    if (!authChecked || !paramsRead || !user || !productTitle || result || analyzing || error) return
    Promise.resolve().then(() => handleAnalyze())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, paramsRead, user, productTitle])

  const loading = !authChecked || !paramsRead

  return (
    <AppLayout user={user}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {productUrl && (
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to AliExpress
          </a>
        )}

        <div className="flex items-center gap-2 mb-1">
          <Zap size={18} className="text-indigo-400" />
          <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Launchory Extension</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-7 w-2/3 bg-gray-900 rounded animate-pulse" />
            <div className="h-40 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
          </div>
        ) : !productTitle ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <p className="text-white font-semibold mb-1.5">No product detected</p>
            <p className="text-gray-500 text-sm mb-6">
              Open this page from the Launchory Chrome extension while viewing an AliExpress product to analyze it.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-snug">{productTitle}</h1>

            {!user ? (
              <LockedPreview title={productTitle} />
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                {analyzing && (
                  <div className="space-y-4">
                    <div className="flex justify-center py-6">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-400 text-sm">Analyzing with AI…</span>
                      </div>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                  </div>
                )}

                {error && !analyzing && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-red-400 text-sm mb-3">{error}</p>
                      <button
                        onClick={handleAnalyze}
                        className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                {result && !analyzing && <AnalysisResultView result={result} />}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

function LockedPreview({ title }: { title: string }) {
  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-hidden">
      <div className="pointer-events-none select-none blur-sm opacity-60 space-y-6">
        <div className="flex items-center gap-6 p-5 bg-gray-800/60 border border-gray-700 rounded-xl">
          <div className="w-24 h-24 rounded-full flex items-center justify-center shrink-0" style={{ background: 'conic-gradient(#ef4444 310deg, #1f2937 0deg)' }}>
            <div className="w-[88px] h-[88px] rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">87</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Competition</span>
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Suggested Price</span>
              <div className="flex items-center gap-1.5 mt-1">
                <DollarSign size={14} className="text-green-400" />
                <span className="text-white font-bold text-base">$24.99-$39.99</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={15} className="text-indigo-400" />
            <span className="text-white font-semibold text-sm">Ad Angles</span>
          </div>
          <div className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl mb-2">
            <p className="text-gray-300 text-sm">This is the one hack every busy parent needs to see</p>
          </div>
          <div className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl mb-2">
            <p className="text-gray-300 text-sm">Stop wasting money on products that don&apos;t work</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Megaphone size={15} className="text-orange-400" />
            <span className="text-white font-semibold text-sm">Video Hooks</span>
          </div>
          <div className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
            <p className="text-gray-300 text-sm italic">&ldquo;I wish I found this sooner&rdquo;</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-gray-950/70 backdrop-blur-[1px] p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-indigo-400" />
          </div>
          <p className="text-white font-semibold mb-1.5">Create your free account to analyze this product</p>
          <p className="text-gray-400 text-sm mb-2">
            Get the real demand score, competition level, ad angles, and hooks for &ldquo;{title}&rdquo; in seconds.
          </p>
          <p className="text-gray-500 text-xs mb-6">Join 1,000+ dropshippers already using Launchory</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            <Zap size={15} />
            Get Free Analysis
          </Link>
        </div>
      </div>
    </div>
  )
}
