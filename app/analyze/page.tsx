'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Zap, Lock, AlertCircle, DollarSign, Target, Clock, Megaphone, Bookmark, CheckCircle2, Sparkles } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { AppLayout } from '@/app/components/AppLayout'
import { AnalysisResultView } from '@/app/components/AnalysisResultView'
import { ScoreRing } from '@/app/components/ScoreRing'
import { SupplierQuickLinks } from '@/app/components/SupplierQuickLinks'
import type { AnalysisResult, Product } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function AnalyzePage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [productUrl, setProductUrl] = useState('')
  const [productTitle, setProductTitle] = useState('')
  const [paramsRead, setParamsRead] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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

  // A lightweight stand-in Product — this analysis didn't come from the
  // catalog, so there's no real row/id, but AnalysisResultView's saturation
  // meter and the dashboard hand-off both want something Product-shaped.
  const pseudoProduct: Product | null = useMemo(() => {
    if (!result) return null
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ext-${Date.now()}`,
      title: productTitle,
      description: result.summary,
      image_url: '',
      niche: '',
      supplier_url: productUrl,
      demand_score: result.demand_score,
      trend_label: 'Rising',
      is_featured: false,
      created_at: new Date().toISOString(),
      views: 0,
      saves_count: 0,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  function handleGenerateAd() {
    if (!result || !pseudoProduct) return
    sessionStorage.setItem('launchoryPendingAnalysis', JSON.stringify({ product: pseudoProduct, result }))
    router.push('/')
  }

  async function handleSaveToDashboard() {
    if (!user || !productTitle || saving || saved) return
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = createBrowserClient()
      const { error: insertError } = await supabase.from('product_requests').insert({
        user_id: user.id,
        product_name: productTitle,
        product_url: productUrl || null,
        reason: result
          ? `Found via the Chrome extension. AI demand score: ${result.demand_score}/100, competition: ${result.competition_level}.`
          : 'Found via the Chrome extension.',
      })
      if (insertError) throw insertError
      setSaved(true)
    } catch {
      setSaveError('Could not save this product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const loading = !authChecked || !paramsRead
  const backHref = productUrl || 'https://www.aliexpress.com'

  return (
    <AppLayout user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <>
                {analyzing && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="w-12 h-12 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <p className="text-white font-semibold">Analyzing product with AI…</p>
                        <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1.5">
                          <Clock size={13} />
                          This usually takes 5-10 seconds
                        </p>
                      </div>
                    </div>
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

                {result && !analyzing && (
                  <div className="space-y-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                      <AnalysisResultView result={result} product={pseudoProduct ?? undefined} />
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Find suppliers</p>
                      <SupplierQuickLinks title={productTitle} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleGenerateAd}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3.5 rounded-xl transition-colors"
                      >
                        <Sparkles size={16} />
                        Generate Ad Creative
                      </button>
                      <button
                        onClick={handleSaveToDashboard}
                        disabled={saving || saved}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:hover:bg-gray-800 border border-gray-700 text-white text-sm font-semibold px-5 py-3.5 rounded-xl transition-colors disabled:cursor-default"
                      >
                        {saved ? (
                          <>
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            Saved
                          </>
                        ) : saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Bookmark size={16} />
                            Save to Dashboard
                          </>
                        )}
                      </button>
                    </div>
                    {saveError && <p className="text-red-400 text-xs -mt-4">{saveError}</p>}
                    {saved && (
                      <p className="text-gray-500 text-xs -mt-4">
                        We&rsquo;ll review it and add it to your feed within 48 hours.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <a
              href={backHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium mt-10 transition-colors"
            >
              <ArrowLeft size={15} />
              Analyze Another Product
            </a>
          </>
        )}
      </div>
    </AppLayout>
  )
}

function LockedPreview({ title }: { title: string }) {
  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-hidden">
      {/* Real-looking teaser — score + competition + one ad angle, shown clearly */}
      <div className="flex items-center gap-6 p-5 bg-gray-800/60 border border-gray-700 rounded-xl mb-6 flex-wrap">
        <ScoreRing score={87} size="lg" animate />
        <div>
          <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Competition</span>
          <div className="mt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} className="text-indigo-400" />
          <span className="text-white font-semibold text-sm">Ad Angle</span>
        </div>
        <div className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
          <p className="text-gray-300 text-sm">This is the one hack every busy parent needs to see</p>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-50 space-y-6">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-white font-bold text-base">$24.99-$39.99</span>
          </div>
          <div className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
            <p className="text-gray-300 text-sm">Stop wasting money on products that don&apos;t work</p>
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

        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/75 backdrop-blur-[1px] p-6">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={22} className="text-indigo-400" />
            </div>
            <p className="text-white font-semibold mb-1.5">Unlock the full analysis for &ldquo;{title}&rdquo;</p>
            <p className="text-gray-400 text-sm mb-6">
              Suggested pricing, 3 ad angles, video hooks, target audience, and more.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              <Zap size={15} />
              Sign up free — takes 30 seconds
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
