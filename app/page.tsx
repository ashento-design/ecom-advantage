'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Flame, Star, BarChart3, Clock } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { useSavedProducts } from '@/app/lib/useSavedProducts'
import { useProductAnalysis } from '@/app/lib/useProductAnalysis'
import { useToast } from '@/app/lib/useToast'
import { Navbar } from '@/app/components/Navbar'
import { ProductCard, ProductCardSkeleton } from '@/app/components/ProductCard'
import { AnalysisModal } from '@/app/components/AnalysisModal'
import { UpgradeModal } from '@/app/components/UpgradeModal'
import { Toast } from '@/app/components/Toast'
import { OnboardingModal } from '@/app/components/OnboardingModal'
import { WELCOME_TOAST_KEY, WELCOME_TOAST_MESSAGE } from '@/app/lib/welcomeToast'
import type { Product } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

type SortOption = 'demand' | 'newest' | 'trending'
type TabOption = 'all' | 'hot' | 'new' | 'staff'

const trendRank: Record<string, number> = { Hot: 0, Trending: 1, Rising: 2 }

const tabs: { value: TabOption; label: string; defaultSort: SortOption }[] = [
  { value: 'all', label: 'All Products', defaultSort: 'demand' },
  { value: 'hot', label: 'Hot This Week', defaultSort: 'demand' },
  { value: 'new', label: 'New Arrivals', defaultSort: 'newest' },
  { value: 'staff', label: 'Staff Picks', defaultSort: 'demand' },
]

function applyTab(products: Product[], tab: TabOption) {
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000
  if (tab === 'hot') return products.filter((p) => p.trend_label === 'Hot')
  if (tab === 'new') return products.filter((p) => Date.now() - new Date(p.created_at).getTime() < fourteenDaysMs)
  if (tab === 'staff') return products.filter((p) => p.is_featured)
  return products
}

function sortProducts(products: Product[], sortBy: SortOption) {
  const sorted = [...products]
  if (sortBy === 'newest') {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sortBy === 'trending') {
    sorted.sort((a, b) => {
      const rankDiff = (trendRank[a.trend_label] ?? 3) - (trendRank[b.trend_label] ?? 3)
      return rankDiff !== 0 ? rankDiff : b.demand_score - a.demand_score
    })
  } else {
    sorted.sort((a, b) => b.demand_score - a.demand_score)
  }
  return sorted
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('demand')
  const [activeTab, setActiveTab] = useState<TabOption>('all')

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
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

  useEffect(() => {
    if (sessionStorage.getItem(WELCOME_TOAST_KEY)) {
      sessionStorage.removeItem(WELCOME_TOAST_KEY)
      showToast(WELCOME_TOAST_MESSAGE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!user) return
    async function checkOnboarding() {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user!.id)
        .single()

      // Missing column (migration not run yet) or missing row shouldn't block the dashboard.
      if (error) {
        console.error('Failed to check onboarding status:', error.message)
        return
      }
      if (data?.onboarding_completed === false) {
        setShowOnboarding(true)
      }
    }
    checkOnboarding()
  }, [user])

  async function completeOnboarding() {
    setShowOnboarding(false)
    if (!user) return
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)
    if (error) {
      console.error('Failed to mark onboarding complete:', error.message)
    }
  }

  function handleTabClick(tab: TabOption) {
    setActiveTab(tab)
    setSortBy(tabs.find((t) => t.value === tab)!.defaultSort)
  }

  const tabFiltered = applyTab(products, activeTab)
  const filtered = filter === 'All' ? tabFiltered : tabFiltered.filter((p) => p.niche === filter)
  const sorted = sortProducts(filtered, sortBy)

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

      {showOnboarding && (
        <OnboardingModal
          niches={niches.filter((n) => n !== 'All')}
          onComplete={completeOnboarding}
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
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-gray-400">Curated daily. AI-analyzed. Ready to test.</p>
            <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
              <Clock size={12} />
              Last updated: Today
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Products today', value: products.length.toString(), icon: <BarChart3 size={16} className="text-indigo-400" />, border: 'border-l-indigo-500' },
            { label: 'Avg demand score', value: products.length ? Math.round(products.reduce((a, b) => a + b.demand_score, 0) / products.length).toString() : '0', icon: <TrendingUp size={16} className="text-green-400" />, border: 'border-l-green-500' },
            { label: 'Hot products', value: products.filter(p => p.trend_label === 'Hot').length.toString(), icon: <Flame size={16} className="text-red-400" />, border: 'border-l-red-500' },
          ].map((stat) => (
            <div key={stat.label} className={`h-full bg-gray-900 border border-gray-800 border-l-4 ${stat.border} rounded-xl p-4 flex flex-col justify-center`}>
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-gray-500 text-xs font-medium">{stat.label}</span>
              </div>
              <span className="text-white text-2xl font-bold">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 border-b border-gray-800 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`shrink-0 pb-3 pt-1 text-base font-semibold border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'text-white border-indigo-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
            {niches.map((niche) => (
              <button
                key={niche}
                onClick={() => setFilter(niche)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === niche
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="shrink-0 bg-gray-900 border border-gray-800 text-gray-300 text-sm font-medium rounded-xl px-4 py-2 outline-none focus:border-gray-600 transition-colors"
          >
            <option value="demand">Sort: Highest Demand</option>
            <option value="newest">Sort: Newest First</option>
            <option value="trending">Sort: Trending First</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((product) => (
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
