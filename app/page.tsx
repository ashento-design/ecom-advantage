'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp, Flame, ArrowUp, Bookmark, ExternalLink, Zap,
  Search, Bell, User, BarChart3, Star, X, DollarSign,
  Target, Megaphone, AlertCircle,
} from 'lucide-react'

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
                      <p className="text-gray-300 text-sm leading-relaxed italic">"{hook}"</p>
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

function ProductCard({ product, onAnalyze }: { product: Product; onAnalyze: (p: Product) => void }) {
  const trend = trendConfig[product.trend_label] ?? trendConfig['Rising']
  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5">
      <div className="relative h-48 overflow-hidden bg-gray-800">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${trend.color}`}>
            {trend.icon}
            {product.trend_label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button className="w-8 h-8 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors border border-gray-700">
            <Bookmark size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
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

  const niches = ['All', ...Array.from(new Set(products.map((p) => p.niche)))]

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
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
      if (!res.ok) {
        setAnalysisError(data?.error ?? 'Analysis failed. Please try again.')
      } else {
        setAnalysisResult(data)
      }
    } catch (err) {
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

  const filtered = filter === 'All' ? products : products.filter((p) => p.niche === filter)

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

      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Ecom Advantage</span>
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
              <button className="ml-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 transition-colors">
                <User size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-indigo-400" />
            <span className="text-indigo-400 text-sm font-medium">Today's winning products</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Product Research Feed</h1>
          <p className="text-gray-400">Curated daily. AI-analyzed. Ready to test.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Products today', value: products.length.toString(), icon: <BarChart3 size={16} className="text-indigo-400" /> },
            { label: 'Avg demand score', value: products.length ? Math.round(products.reduce((a, b) => a + b.demand_score, 0) / products.length).toString() : '0', icon: <TrendingUp size={16} className="text-green-400" /> },
            { label: 'Hot products', value: products.filter(p => p.trend_label === 'Hot').length.toString(), icon: <Flame size={16} className="text-red-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-80 animate-pulse" />
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
