'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Flame, ArrowUp, Bookmark, ExternalLink, Zap,
  Search, Bell, User, BarChart3, Rocket, Star, X, DollarSign,
  Target, Megaphone, AlertCircle, LogOut, Check,
} from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type Product = {
  id: string
  title: string
  description: string
  image_url: string
  niche: string
  supplier_url: string
  demand_score: number
  trend_label: string
  is_featured: boolean
  created_at: string
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function isNewProduct(createdAt: string) {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return Date.now() - new Date(createdAt).getTime() < sevenDaysMs
}

type AnalysisResult = {
  demand_score: number
  competition_level: 'Low' | 'Medium' | 'High'
  suggested_price: string
  ad_angles: string[]
  hooks: string[]
  summary: string
}

const trendConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Hot: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Flame size={12} /> },
  Trending: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <TrendingUp size={12} /> },
  Rising: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <ArrowUp size={12} /> },
}

const competitionConfig: Record<string, string> = {
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
}

function ScoreRing({ score, size = 'sm' }: { score: number; size?: 'sm' | 'lg' }) {
  const color = score >= 85 ? '#ef4444' : score >= 70 ? '#f97316' : '#3b82f6'
  const dim = size === 'lg' ? 'w-24 h-24' : 'w-14 h-14'
  const textSize = size === 'lg' ? 'text-2xl' : 'text-sm'
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative ${dim} rounded-full flex items-center justify-center`}
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #1f2937 0deg)` }}
      >
        <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
          <span className={`${textSize} font-bold text-white`}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500">demand</span>
    </div>
  )
}

function AnalysisModal({
  product,
  result,
  loading,
  error,
  onClose,
}: {
  product: Product
  result: AnalysisResult | null
  loading: boolean
  error: string | null
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 pb-4 bg-gray-900 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-indigo-400" />
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">AI Analysis</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-snug">{product.title}</h2>
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">{product.niche}</span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-700"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 pt-5 space-y-6">
          {loading && (
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

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Score + Competition + Price row */}
              <div className="flex items-center gap-6 p-5 bg-gray-800/60 border border-gray-700 rounded-xl">
                <ScoreRing score={result.demand_score} size="lg" />
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Competition</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${competitionConfig[result.competition_level] ?? competitionConfig['Medium']}`}>
                        {result.competition_level}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Suggested Price</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <DollarSign size={14} className="text-green-400" />
                      <span className="text-white font-bold text-base">{result.suggested_price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
              </div>

              {/* Ad Angles */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={15} className="text-indigo-400" />
                  <span className="text-white font-semibold text-sm">Ad Angles</span>
                </div>
                <div className="space-y-2">
                  {result.ad_angles.map((angle, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
                      <span className="shrink-0 w-5 h-5 bg-indigo-600/30 text-indigo-400 rounded-md flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 text-sm leading-relaxed">{angle}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hooks */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone size={15} className="text-orange-400" />
                  <span className="text-white font-semibold text-sm">Video Hooks</span>
                </div>
                <div className="space-y-2">
                  {result.hooks.map((hook, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
                      <span className="shrink-0 w-5 h-5 bg-orange-600/30 text-orange-400 rounded-md flex items-center justify-center text-xs font-bold border border-orange-500/30">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{hook}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function UpgradeModal({ onClose, onUpgrade, upgrading }: { onClose: () => void; onUpgrade: () => void; upgrading: boolean }) {
  const perks = ['Unlimited AI analyses', 'Full product feed', 'Breakout alerts', 'Priority support']
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-700"
        >
          <X size={16} className="text-gray-400" />
        </button>

        <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <Zap size={26} className="text-indigo-400" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">You&apos;ve reached your free limit</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          You&apos;ve used all 3 of your free AI analyses. Upgrade to Pro for unlimited analyses, full product access, and more.
        </p>

        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-6 text-left space-y-2.5">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-indigo-600/30 flex items-center justify-center shrink-0">
                <Check size={10} className="text-indigo-400" />
              </div>
              <span className="text-gray-300 text-sm">{perk}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onUpgrade}
          disabled={upgrading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
        >
          {upgrading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Redirecting…
            </>
          ) : (
            'Upgrade to Pro - $29/month'
          )}
        </button>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-800" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-gray-800 rounded" />
            <div className="h-4 w-3/4 bg-gray-800 rounded" />
          </div>
          <div className="w-14 h-14 rounded-full bg-gray-800 shrink-0" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-gray-800 rounded" />
          <div className="h-3 w-2/3 bg-gray-800 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-800 rounded-xl" />
          <div className="w-10 h-10 bg-gray-800 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onAnalyze }: { product: Product; onAnalyze: (p: Product) => void }) {
  const trend = trendConfig[product.trend_label] ?? trendConfig['Rising']
  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5">
      <div className="relative h-64 overflow-hidden bg-gray-800">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${trend.color}`}>
            {trend.icon}
            {product.trend_label}
          </span>
          {isNewProduct(product.created_at) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
              NEW
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <button className="w-8 h-8 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors border border-gray-700">
            <Bookmark size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.niche}</span>
            <h3 className="text-white font-semibold text-base mt-0.5 leading-snug">{product.title}</h3>
          </div>
          <ScoreRing score={product.demand_score} />
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{product.description}</p>
        <div className="flex gap-2">
          <button
            onClick={() => onAnalyze(product)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={14} />
            AI Analyze
          </button>
          <a
            href={product.supplier_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors border border-gray-700"
          >
            <ExternalLink size={14} className="text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const niches = ['All', ...Array.from(new Set(products.map((p) => p.niche)))]

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('demand_score', { ascending: false })
        if (error) {
          console.error('Supabase error:', JSON.stringify(error), error)
        } else {
          setProducts(data ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/landing')
        return
      }
      setUser(data.user)
      setAuthChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/landing')
        return
      }
      setUser(session.user)
    })
    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function analyzeProduct(product: Product) {
    setSelectedProduct(product)
    setAnalysisResult(null)
    setAnalysisError(null)
    setAnalysisLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          niche: product.niche,
        }),
      })
      const data = await res.json()
      if (res.status === 403 && data?.error === 'limit_reached') {
        closeModal()
        setShowUpgradeModal(true)
      } else if (!res.ok) {
        setAnalysisError(data?.error ?? 'Analysis failed. Please try again.')
      } else {
        setAnalysisResult(data)
      }
    } catch {
      setAnalysisError('Network error. Please try again.')
    } finally {
      setAnalysisLoading(false)
    }
  }

  function closeModal() {
    setSelectedProduct(null)
    setAnalysisResult(null)
    setAnalysisError(null)
  }

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      }
    } finally {
      setUpgrading(false)
    }
  }

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/auth/login')
    router.refresh()
  }

  const filtered = filter === 'All' ? products : products.filter((p) => p.niche === filter)

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {selectedProduct && (
        <AnalysisModal
          product={selectedProduct}
          result={analysisResult}
          loading={analysisLoading}
          error={analysisError}
          onClose={closeModal}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
          upgrading={upgrading}
        />
      )}

      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Launchory</span>
              <span className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium ml-1">BETA</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                <Search size={16} />
                <span className="hidden sm:inline">Search</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                <Bell size={16} />
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                <Bookmark size={16} />
                <span className="hidden sm:inline">Saved</span>
              </button>
              {user ? (
                <div className="relative ml-2" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 transition-colors"
                  >
                    <User size={15} className="text-white" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={14} className="text-gray-400" />
                        My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <div className="mb-6 bg-gradient-to-r from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-2xl px-5 py-4">
            <p className="text-white font-semibold text-base">
              {getGreeting()}, {(user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? user.email?.split('@')[0]}! Here are today&apos;s winning products.
            </p>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-indigo-400" />
            <span className="text-indigo-400 text-sm font-medium">Today&apos;s winning products</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Product Research Feed</h1>
          <p className="text-gray-400">Curated daily. AI-analyzed. Ready to test.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Products today', value: products.length.toString(), icon: <BarChart3 size={16} className="text-indigo-400" />, border: 'border-indigo-500/30' },
            { label: 'Avg demand score', value: products.length ? Math.round(products.reduce((a, b) => a + b.demand_score, 0) / products.length).toString() : '0', icon: <TrendingUp size={16} className="text-green-400" />, border: 'border-green-500/30' },
            { label: 'Hot products', value: products.filter(p => p.trend_label === 'Hot').length.toString(), icon: <Flame size={16} className="text-red-400" />, border: 'border-red-500/30' },
          ].map((stat) => (
            <div key={stat.label} className={`h-full bg-gray-900 border ${stat.border} rounded-xl p-4 flex flex-col justify-center`}>
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-gray-500 text-xs font-medium">{stat.label}</span>
              </div>
              <span className="text-white text-2xl font-bold">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => setFilter(niche)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === niche
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAnalyze={analyzeProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
