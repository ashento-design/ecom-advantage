'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Search, TrendingUp, TrendingDown, Minus, Users, Tag, Megaphone, Calendar,
  Lightbulb, Target, Lock, Sparkles, Clock, DollarSign,
} from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { Navbar } from '@/app/components/Navbar'
import { UpgradeModal } from '@/app/components/UpgradeModal'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const EXAMPLE_STORES = ['gymshark.com', 'colourpop.com', 'ohpolly.com', 'fashionnova.com']

type ScrapedProduct = { title: string; price: string; image_url: string }

type StoreAnalysis = {
  store_name: string
  estimated_monthly_revenue: string
  estimated_monthly_visitors: string
  confidence_level: 'Low' | 'Medium' | 'High'
  top_products: ScrapedProduct[]
  main_niches: string[]
  ad_activity: 'Active' | 'Low' | 'Unknown'
  store_age_estimate: string
  revenue_trend: 'Growing' | 'Stable' | 'Declining' | 'Unknown'
  insights: string[]
  winning_angles: string[]
}

type RecentAnalysis = {
  id: string
  store_url: string
  store_name: string | null
  analysis_data: StoreAnalysis
  created_at: string
}

const confidenceColor: Record<string, string> = {
  Low: 'bg-gray-800 text-gray-400 border-gray-700',
  Medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  High: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30',
}

const trendConfig: Record<string, { icon: typeof TrendingUp; color: string }> = {
  Growing: { icon: TrendingUp, color: 'text-emerald-400' },
  Stable: { icon: Minus, color: 'text-gray-400' },
  Declining: { icon: TrendingDown, color: 'text-red-400' },
  Unknown: { icon: Minus, color: 'text-gray-500' },
}

export default function StoreIntelligencePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isPro, setIsPro] = useState<boolean | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [storeUrl, setStoreUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StoreAnalysis | null>(null)
  const [recent, setRecent] = useState<RecentAnalysis[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/auth/login')
        return
      }
      setUser(data.user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', data.user.id)
        .single()
      setIsPro(profile?.plan === 'pro')
      setAuthChecked(true)
    })
  }, [router])

  useEffect(() => {
    if (!isPro) return
    fetch('/api/store-intelligence')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setRecent(data) })
      .catch(() => {})
  }, [isPro])

  async function handleAnalyze(urlOverride?: string) {
    const target = urlOverride ?? storeUrl
    if (!target.trim()) return
    setAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/store-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeUrl: target.trim() }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(
          data?.error === 'invalid_url' ? 'That doesn\'t look like a valid store URL.' :
          data?.error === 'store_unreachable' ? 'Couldn\'t reach that store\'s public data. Make sure it\'s a live Shopify store.' :
          data?.error === 'analysis_failed' ? 'Analysis failed. Please try again.' :
          'Something went wrong. Please try again.'
        )
        return
      }
      setResult(data)
      setStoreUrl(target)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data?.url) window.location.href = data.url
    } finally {
      setUpgrading(false)
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-950">
        {showUpgradeModal && (
          <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgrade} upgrading={upgrading} error={null} />
        )}
        <Navbar user={user} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="w-16 h-16 bg-indigo-600/15 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={26} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Store Intelligence is a Pro feature</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Discover how much any Shopify store is making, spy on their winning products, and steal their ad angles. Upgrade to Pro to unlock it.
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Sparkles size={16} />
            Upgrade to Pro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar user={user} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Search size={16} className="text-indigo-400" />
            <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Pro Feature</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Store Intelligence</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Discover how much any Shopify store is making and steal their winning products.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyze() }}
            placeholder="Enter any Shopify store URL…"
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={analyzing || !storeUrl.trim()}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl transition-colors shrink-0"
          >
            {analyzing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Analyze Store
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-10">
          <span className="text-gray-600 text-xs">Try:</span>
          {EXAMPLE_STORES.map((store) => (
            <button
              key={store}
              onClick={() => { setStoreUrl(store); handleAnalyze(store) }}
              disabled={analyzing}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50"
            >
              {store}
            </button>
          ))}
        </div>

        {recent.length > 0 && !result && !analyzing && (
          <div className="mb-10">
            <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Recent Analyses</p>
            <div className="space-y-2">
              {recent.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setResult(r.analysis_data); setStoreUrl(r.store_url) }}
                  className="w-full flex items-center justify-between gap-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 text-left transition-colors"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{r.store_name ?? r.store_url}</p>
                    <p className="text-gray-500 text-xs">{r.store_url}</p>
                  </div>
                  <span className="text-gray-500 text-xs shrink-0">{new Date(r.created_at).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {analyzing && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-white font-semibold text-sm">Analyzing store…</p>
              <p className="text-gray-500 text-xs mt-1">This takes 15-30 seconds</p>
            </div>
          </div>
        )}

        {error && !analyzing && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {result && !analyzing && (
          <div className="space-y-6">
            {/* Revenue card */}
            <div className="bg-gradient-to-br from-indigo-600/15 to-gray-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                <h2 className="text-white font-bold text-lg">{result.store_name}</h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${confidenceColor[result.confidence_level] ?? confidenceColor.Low}`}>
                  {result.confidence_level} Confidence
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={20} className="text-emerald-400" />
                <span className="text-3xl font-bold text-white">{result.estimated_monthly_revenue}</span>
              </div>
              <p className="text-gray-500 text-sm">Estimated monthly revenue</p>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <Users size={15} className="text-indigo-400 mb-2" />
                <p className="text-white font-semibold text-sm">{result.estimated_monthly_visitors}</p>
                <p className="text-gray-500 text-xs mt-0.5">Monthly visitors</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <Tag size={15} className="text-indigo-400 mb-2" />
                <p className="text-white font-semibold text-sm truncate">{result.main_niches?.join(', ') || 'Unknown'}</p>
                <p className="text-gray-500 text-xs mt-0.5">Niches</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <Megaphone size={15} className="text-indigo-400 mb-2" />
                <p className="text-white font-semibold text-sm">{result.ad_activity}</p>
                <p className="text-gray-500 text-xs mt-0.5">Ad activity</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <Calendar size={15} className="text-indigo-400 mb-2" />
                <p className="text-white font-semibold text-sm">{result.store_age_estimate}</p>
                <p className="text-gray-500 text-xs mt-0.5">Store age</p>
              </div>
            </div>

            {/* Revenue trend */}
            {(() => {
              const trend = trendConfig[result.revenue_trend] ?? trendConfig.Unknown
              const TrendIcon = trend.icon
              return (
                <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                  <TrendIcon size={16} className={trend.color} />
                  <span className="text-gray-300 text-sm">Revenue trend: <span className={`font-semibold ${trend.color}`}>{result.revenue_trend}</span></span>
                </div>
              )
            })()}

            {/* Top products */}
            {result.top_products?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold text-sm mb-3">Top Products</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.top_products.slice(0, 8).map((p, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="relative h-24 bg-gray-800">
                        {p.image_url && (
                          <Image src={p.image_url} alt={p.title} fill sizes="200px" className="object-cover" unoptimized />
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-white text-xs font-medium truncate">{p.title}</p>
                        <p className="text-emerald-400 text-xs font-semibold mt-0.5">{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {result.insights?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={15} className="text-yellow-400" />
                  <h3 className="text-white font-semibold text-sm">AI Insights</h3>
                </div>
                <div className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-900 border border-gray-800 rounded-xl">
                      <span className="shrink-0 w-5 h-5 bg-yellow-500/15 text-yellow-400 rounded-md flex items-center justify-center text-xs font-bold border border-yellow-500/30">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Winning angles */}
            {result.winning_angles?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={15} className="text-indigo-400" />
                  <h3 className="text-white font-semibold text-sm">Winning Angles</h3>
                </div>
                <div className="space-y-2">
                  {result.winning_angles.map((angle, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
                      <Clock size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                      <p className="text-gray-300 text-sm leading-relaxed">{angle}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
