'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TrendingUp, Flame, Star, BarChart3, Clock, AlertCircle, RotateCw } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { useSavedProducts } from '@/app/lib/useSavedProducts'
import { useProductAnalysis } from '@/app/lib/useProductAnalysis'
import { useToast } from '@/app/lib/useToast'
import { AppLayout } from '@/app/components/AppLayout'
import { ProductCard, ProductCardSkeleton } from '@/app/components/ProductCard'
import { Pagination } from '@/app/components/Pagination'
import { AnalysisModal } from '@/app/components/AnalysisModal'
import { UpgradeModal } from '@/app/components/UpgradeModal'
import { Toast } from '@/app/components/Toast'
import { OnboardingModal } from '@/app/components/OnboardingModal'
import { BackToTopButton } from '@/app/components/BackToTopButton'
import { WELCOME_TOAST_KEY, WELCOME_TOAST_MESSAGE } from '@/app/lib/welcomeToast'
import { captureReferralCode } from '@/app/lib/referral'
import { getCachedProducts, setCachedProducts } from '@/app/lib/productCache'
import { computeLaunchoryScore } from '@/app/lib/launchoryScore'
import { getRecentlyViewed, type RecentlyViewedProduct } from '@/app/lib/recentlyViewed'
import { RecentlyViewedRow } from '@/app/components/RecentlyViewedRow'
import { ProTipCard } from '@/app/components/ProTipCard'
import type { Product } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

type SortOption = 'demand' | 'newest' | 'trending' | 'views' | 'launchory'
type TabOption = 'all' | 'hot' | 'new' | 'staff'

const trendRank: Record<string, number> = { Hot: 0, Trending: 1, Rising: 2 }
const PRO_TIP_DISMISSED_KEY = 'launchory_pro_tip_dismissed'

const tabs: { value: TabOption; label: string; defaultSort: SortOption }[] = [
  { value: 'all', label: 'All Products', defaultSort: 'demand' },
  { value: 'hot', label: 'Hot This Week', defaultSort: 'demand' },
  { value: 'new', label: 'New Arrivals', defaultSort: 'newest' },
  { value: 'staff', label: 'Staff Picks', defaultSort: 'demand' },
]

function sortProducts(products: Product[], sortBy: SortOption) {
  const sorted = [...products]
  if (sortBy === 'newest') {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sortBy === 'trending') {
    sorted.sort((a, b) => {
      const rankDiff = (trendRank[a.trend_label] ?? 3) - (trendRank[b.trend_label] ?? 3)
      return rankDiff !== 0 ? rankDiff : b.demand_score - a.demand_score
    })
  } else if (sortBy === 'views') {
    sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
  } else if (sortBy === 'launchory') {
    sorted.sort((a, b) => computeLaunchoryScore(b).score - computeLaunchoryScore(a).score)
  } else {
    sorted.sort((a, b) => b.demand_score - a.demand_score)
  }
  return sorted
}

const PAGE_SIZE = 12

const COLUMN_SORT: Partial<Record<SortOption, { column: 'demand_score' | 'created_at' | 'views'; ascending: boolean }>> = {
  demand: { column: 'demand_score', ascending: false },
  newest: { column: 'created_at', ascending: false },
  views: { column: 'views', ascending: false },
}

// Fetches one page of the feed with the tab/niche filters and sort pushed
// down to Supabase via .range() instead of loading every product. "Trending"
// and "Launchory Score" are computed rankings rather than a single indexed
// column, so those two sorts fall back to pulling the filtered set and
// ranking it in memory before slicing out the requested page.
async function fetchProductPage(tab: TabOption, niche: string, sortBy: SortOption, page: number) {
  const supabase = createBrowserClient()
  let query = supabase.from('products').select('*', { count: 'exact' })

  if (tab === 'hot') query = query.eq('trend_label', 'Hot')
  if (tab === 'staff') query = query.eq('is_featured', true)
  if (tab === 'new') {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', fourteenDaysAgo)
  }
  if (niche !== 'All') query = query.eq('niche', niche)

  const from = (page - 1) * PAGE_SIZE
  const columnSort = COLUMN_SORT[sortBy]

  if (columnSort) {
    const { data, error, count } = await query
      .order(columnSort.column, { ascending: columnSort.ascending })
      .range(from, from + PAGE_SIZE - 1)
    return { data, error, count }
  }

  const { data, error, count } = await query
  if (error || !data) return { data: null, error, count: null }
  const ranked = sortProducts(data, sortBy)
  return { data: ranked.slice(from, from + PAGE_SIZE), error: null, count }
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [retryToken, setRetryToken] = useState(0)
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('demand')
  const [activeTab, setActiveTab] = useState<TabOption>('all')

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profilePlan, setProfilePlan] = useState<string | null>(null)
  const [preferredNiches, setPreferredNiches] = useState<string[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([])
  const [proTipDismissed, setProTipDismissed] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pageProducts, setPageProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const isFirstPageRender = useRef(true)

  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) params.delete('page')
    else params.set('page', String(page))
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const { toastMessage, showToast } = useToast()
  const { savedIds, toggleSave } = useSavedProducts(user, showToast)
  const {
    selectedProduct, analysisResult, analysisLoading, analysisError,
    showUpgradeModal, upgrading, upgradeError,
    analyzeProduct, closeModal, setShowUpgradeModal, handleUpgrade,
  } = useProductAnalysis()

  const allNiches = Array.from(new Set(products.map((p) => p.niche)))
  const orderedNiches = [
    ...allNiches.filter((n) => preferredNiches.includes(n)),
    ...allNiches.filter((n) => !preferredNiches.includes(n)),
  ]
  const niches = ['All', ...orderedNiches]

  useEffect(() => {
    // Skip the network round-trip on a fresh cache hit — the feed rarely
    // changes minute to minute, so a 5-minute cache avoids re-fetching the
    // whole product list every time the user navigates back to "/".
    // An explicit retry (retryToken > 0) always bypasses the cache.
    if (retryToken === 0) {
      const cached = getCachedProducts()
      if (cached) {
        Promise.resolve().then(() => setProducts(cached))
        return
      }
    }

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
          setCachedProducts(data ?? [])
        }
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    }
    fetchProducts()
  }, [retryToken])

  useEffect(() => {
    let cancelled = false
    setPageLoading(true)
    setPageError(false)
    fetchProductPage(activeTab, filter, sortBy, currentPage).then(({ data, error, count }) => {
      if (cancelled) return
      if (error || !data) {
        console.error('Failed to load product page:', error?.message)
        setPageError(true)
      } else {
        setPageProducts(data)
        setTotalCount(count ?? 0)
      }
      setPageLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [activeTab, filter, sortBy, currentPage, retryToken])

  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false
      return
    }
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentPage])

  function retryFetchProducts() {
    setRetryToken((t) => t + 1)
  }

  useEffect(() => {
    captureReferralCode()
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => {
      setRecentlyViewed(getRecentlyViewed())
      setProTipDismissed(localStorage.getItem(PRO_TIP_DISMISSED_KEY) === '1')
    })
  }, [])

  function dismissProTip() {
    setProTipDismissed(true)
    localStorage.setItem(PRO_TIP_DISMISSED_KEY, '1')
  }

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
        .select('onboarding_completed, plan, preferred_niches')
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
      setProfilePlan(data?.plan ?? 'free')
      setPreferredNiches(data?.preferred_niches ?? [])
    }
    checkOnboarding()
  }, [user])

  async function completeOnboarding(selectedNiches: string[]) {
    setShowOnboarding(false)
    setPreferredNiches(selectedNiches)
    if (!user) return
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true, preferred_niches: selectedNiches })
      .eq('id', user.id)
    if (error) {
      console.error('Failed to mark onboarding complete:', error.message)
    }
  }

  function handleTabClick(tab: TabOption) {
    setActiveTab(tab)
    setSortBy(tabs.find((t) => t.value === tab)!.defaultSort)
    goToPage(1)
  }

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount)

  const recommendedProducts = preferredNiches.length > 0
    ? [...products]
      .filter((p) => preferredNiches.includes(p.niche))
      .sort((a, b) => computeLaunchoryScore(b).score - computeLaunchoryScore(a).score)
      .slice(0, 3)
    : []

  const trendingProduct = products.length > 0
    ? [...products].sort((a, b) => computeLaunchoryScore(b).score - computeLaunchoryScore(a).score)[0]
    : null

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppLayout user={user}>
      {selectedProduct && (
        <AnalysisModal
          product={selectedProduct}
          result={analysisResult}
          loading={analysisLoading}
          error={analysisError}
          onClose={closeModal}
          onAdLimitReached={() => { closeModal(); setShowUpgradeModal(true) }}
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
      <BackToTopButton />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <div className="mb-6 bg-gradient-to-r from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-2xl px-5 py-4">
            <p className="text-white font-semibold text-base">
              {getGreeting()}, {(user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? user.email?.split('@')[0]}! Here are today&apos;s winning products.
            </p>
          </div>
        )}

        {trendingProduct && (
          <button
            onClick={() => analyzeProduct(trendingProduct)}
            className="w-full flex items-center gap-3 mb-6 bg-gradient-to-r from-orange-600/15 to-transparent border border-orange-500/30 rounded-2xl px-5 py-4 text-left hover:border-orange-500/50 transition-colors"
          >
            <Flame size={18} className="text-orange-400 shrink-0" />
            <p className="text-white text-sm">
              <span className="font-semibold">🔥 Trending Now:</span>{' '}
              <span className="text-gray-300">{trendingProduct.title}</span>
              <span className="text-orange-400 font-semibold"> — today&apos;s highest Launchory Score</span>
            </p>
          </button>
        )}

        {user && profilePlan === 'free' && !proTipDismissed && (
          <ProTipCard onDismiss={dismissProTip} />
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
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Updated today
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

        {recommendedProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Star size={15} className="text-indigo-400" />
              <span className="text-white font-semibold text-sm">Recommended for you</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  saved={savedIds.has(product.id)}
                  onToggleSave={toggleSave}
                  onAnalyze={analyzeProduct}
                />
              ))}
            </div>
          </div>
        )}

        <RecentlyViewedRow products={recentlyViewed} />

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
                onClick={() => { setFilter(niche); goToPage(1) }}
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
            onChange={(e) => { setSortBy(e.target.value as SortOption); goToPage(1) }}
            className="shrink-0 bg-gray-900 border border-gray-800 text-gray-300 text-sm font-medium rounded-xl px-4 py-2 outline-none focus:border-gray-600 transition-colors"
          >
            <option value="demand">Sort: Highest Demand</option>
            <option value="launchory">Sort: Launchory Score</option>
            <option value="newest">Sort: Newest First</option>
            <option value="trending">Sort: Trending First</option>
            <option value="views">Sort: Most Viewed</option>
          </select>
        </div>

        <div ref={gridRef} className="scroll-mt-20">
          {!pageLoading && !pageError && totalCount > 0 && (
            <div className="flex justify-end mb-4">
              <p className="text-gray-500 text-sm">
                Showing {rangeStart}-{rangeEnd} of {totalCount} products
              </p>
            </div>
          )}

          {pageLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : pageError ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <p className="text-white font-semibold mb-1">Couldn&apos;t load products</p>
              <p className="text-gray-500 text-sm mb-6">Something went wrong fetching the feed.</p>
              <button
                onClick={retryFetchProducts}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <RotateCw size={14} />
                Retry
              </button>
            </div>
          ) : pageProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No products found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    saved={savedIds.has(product.id)}
                    onToggleSave={toggleSave}
                    onAnalyze={analyzeProduct}
                  />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
