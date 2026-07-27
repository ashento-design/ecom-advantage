'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Lock, Sparkles,
} from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { AppLayout } from '@/app/components/AppLayout'
import { UpgradeModal } from '@/app/components/UpgradeModal'
import { StoreAnalysisCard, type StoreAnalysis } from '@/app/components/StoreAnalysisCard'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const EXAMPLE_STORES = ['gymshark.com', 'colourpop.com', 'ohpolly.com', 'fashionnova.com']

const DEMO_ANALYSIS: StoreAnalysis = {
  store_name: 'Gymshark',
  estimated_monthly_revenue: '$8M - $15M',
  estimated_monthly_visitors: '4.5M - 7M',
  confidence_level: 'High',
  main_niches: ['Fitness Apparel', 'Activewear'],
  ad_activity: 'Active',
  store_age_estimate: '10+ years',
  revenue_trend: 'Growing',
  top_products: [
    { title: 'Seamless Leggings', price: '$60', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
    { title: 'Sports Bra', price: '$35', image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400' },
    { title: 'Training Shorts', price: '$32', image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400' },
    { title: 'Running Shoes', price: '$110', image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400' },
  ],
  insights: [
    'Product drops are timed around new collection launches, creating recurring spikes in traffic and urgency.',
    'Heavy reliance on influencer and athlete-led UGC rather than traditional studio ad creative.',
    'Bundle offers on leggings + sports bra pairs are used to lift average order value.',
    'Strong repeat-purchase rate driven by a loyalty/rewards program tied to the mobile app.',
  ],
  winning_angles: [
    '"Built for your hardest set" — performance-first messaging aimed at serious lifters.',
    'Influencer transformation content pairing a product with a visible before/after result.',
    'Limited restock urgency angle for core bestsellers ("back in stock, won\'t last").',
  ],
}

type RecentAnalysis = {
  id: string
  store_url: string
  store_name: string | null
  analysis_data: StoreAnalysis
  created_at: string
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
          data?.error === 'not_shopify' ? 'This doesn\'t appear to be a Shopify store. Try entering the store\'s main domain like: example.com' :
          data?.error === 'store_unreachable' ? 'Couldn\'t reach that store. Double check the domain and try again.' :
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
      <AppLayout user={user}>
        {showUpgradeModal && (
          <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgrade} upgrading={upgrading} error={null} />
        )}
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
      </AppLayout>
    )
  }

  return (
    <AppLayout user={user}>
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
          <StoreAnalysisCard analysis={result} storeUrl={storeUrl} />
        )}

        {!result && !analyzing && (
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Example Report</p>
            <StoreAnalysisCard analysis={DEMO_ANALYSIS} storeUrl="gymshark.com" isDemo />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
