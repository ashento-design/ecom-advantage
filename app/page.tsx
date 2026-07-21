'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Flame, Star, BarChart3 } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { useSavedProducts } from '@/app/lib/useSavedProducts'
import { useProductAnalysis } from '@/app/lib/useProductAnalysis'
import { useToast } from '@/app/lib/useToast'
import { Navbar } from '@/app/components/Navbar'
import { ProductCard, ProductCardSkeleton } from '@/app/components/ProductCard'
import { AnalysisModal } from '@/app/components/AnalysisModal'
import { UpgradeModal } from '@/app/components/UpgradeModal'
import { Toast } from '@/app/components/Toast'
import type { Product } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  const { toastMessage, showToast } = useToast()
  const { savedIds, toggleSave } = useSavedProducts(user, showToast)
  const {
    selectedProduct, analysisResult, analysisLoading, analysisError,
    showUpgradeModal, upgrading, upgradeError,
    analyzeProduct, closeModal, setShowUpgradeModal, handleUpgrade,
  } = useProductAnalysis()

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
          error={upgradeError}
        />
      )}

      <Toast message={toastMessage} />

      <Navbar user={user} />

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
              <ProductCard
                key={product.id}
                product={product}
                saved={savedIds.has(product.id)}
                onToggleSave={toggleSave}
                onAnalyze={analyzeProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
