'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, Zap, Bookmark, Flame, TrendingUp, ArrowUp, AlertCircle,
  Lock, Share2, Check, Calculator, ThumbsUp, Lightbulb, Store, FlaskConical,
  Copy, Search, Users, Target,
} from 'lucide-react'
import { SupplierQuickLinks } from '@/app/components/SupplierQuickLinks'
import { AdSearchButtons } from '@/app/components/AdSearchButtons'
import { RecentlyViewedRow } from '@/app/components/RecentlyViewedRow'
import { createBrowserClient } from '@/app/lib/supabase'
import { useSavedProducts } from '@/app/lib/useSavedProducts'
import { useProductAnalysis } from '@/app/lib/useProductAnalysis'
import { useToast } from '@/app/lib/useToast'
import { computeLaunchoryScore } from '@/app/lib/launchoryScore'
import { getSaturationInfo } from '@/app/lib/saturation'
import { getAdActivityLevel } from '@/app/lib/adSearchLinks'
import { addProductTest, type TestStatus } from '@/app/lib/productTests'
import { buildSupplierLinks } from '@/app/lib/supplierLinks'
import { getRecentlyViewed, recordRecentlyViewed, type RecentlyViewedProduct } from '@/app/lib/recentlyViewed'
import { AppLayout } from '@/app/components/AppLayout'
import { ProductCard } from '@/app/components/ProductCard'
import { ScoreRing } from '@/app/components/ScoreRing'
import { AnalysisModal } from '@/app/components/AnalysisModal'
import { AnalysisResultView } from '@/app/components/AnalysisResultView'
import { UpgradeModal } from '@/app/components/UpgradeModal'
import { TrackProductModal } from '@/app/components/TrackProductModal'
import { Toast } from '@/app/components/Toast'
import type { Product, AnalysisResult } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Manually update as the real user count grows.
const ACTIVE_USER_COUNT = '1,000+'

// Products don't carry real per-product supplier cost data, so this is a
// flat, disclosed heuristic default (typical low-ticket dropshipping item
// cost) to pre-fill the profit calculator's "Product cost" field — not a
// real AliExpress price for this specific product.
const SUGGESTED_PRODUCT_COST = 12

const trendConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Hot: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Flame size={13} /> },
  Trending: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <TrendingUp size={13} /> },
  Rising: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <ArrowUp size={13} /> },
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const productId = params.id

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [existingAnalysis, setExistingAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [titleCopied, setTitleCopied] = useState(false)
  const [trackingProduct, setTrackingProduct] = useState<Product | null>(null)
  const [trackSaving, setTrackSaving] = useState(false)
  const [isTopInNiche, setIsTopInNiche] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([])

  const { toastMessage, showToast } = useToast()
  const { savedIds, toggleSave } = useSavedProducts(user, showToast)
  const {
    selectedProduct, analysisResult, analysisLoading, analysisError,
    showUpgradeModal, upgrading, upgradeError,
    analyzeProduct, closeModal, setShowUpgradeModal, handleUpgrade,
  } = useProductAnalysis()

  async function handleSaveTrack(status: TestStatus, notes: string) {
    if (!user || !trackingProduct) return
    setTrackSaving(true)
    const { error } = await addProductTest(user.id, trackingProduct.id, status, notes)
    setTrackSaving(false)
    if (error) {
      console.error('Failed to add product test:', error.message)
      return
    }
    setTrackingProduct(null)
    showToast('Added to Testing Board')
  }

  // Public page — no redirect for logged-out visitors. We still track
  // auth state so the AI analysis, save, and existing-analysis fetch can
  // gate themselves on `user` being present.
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setAuthChecked(true)
    })
  }, [])

  async function handleShare() {
    const url = `${window.location.origin}/products/${productId}`
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  async function handleCopyTitle() {
    if (!product) return
    try {
      await navigator.clipboard.writeText(product.title)
      setTitleCopied(true)
      setTimeout(() => setTitleCopied(false), 2000)
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => setRecentlyViewed(getRecentlyViewed()))
  }, [])

  useEffect(() => {
    if (!authChecked || !productId) return

    async function load() {
      const supabase = createBrowserClient()

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError || !productData) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setProduct(productData)
      recordRecentlyViewed({
        id: productData.id,
        title: productData.title,
        image_url: productData.image_url,
        niche: productData.niche,
      })

      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('niche', productData.niche)
        .neq('id', productId)
        .limit(3)
      setRelatedProducts(related ?? [])

      const { data: nicheProducts } = await supabase
        .from('products')
        .select('id, demand_score, views, saves_count, trend_label')
        .eq('niche', productData.niche)
      const ranked = [...(nicheProducts ?? [])].sort(
        (a, b) => computeLaunchoryScore(b).score - computeLaunchoryScore(a).score
      )
      const rank = ranked.findIndex((p) => p.id === productId)
      setIsTopInNiche(rank !== -1 && rank < 5)

      if (user) {
        const { data: analyses } = await supabase
          .from('ai_analyses')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
          .limit(1)
        if (analyses && analyses.length > 0) {
          setExistingAnalysis(analyses[0] as AnalysisResult)
        }
      }

      setLoading(false)
    }
    load()
  }, [authChecked, productId, user])

  // Separate from the load effect (which re-runs on user changes) so this
  // fires exactly once per product view, not once per auth state change.
  useEffect(() => {
    if (!authChecked || !productId) return
    fetch(`/api/products/${productId}/view`, { method: 'POST' }).catch(() => {})
  }, [authChecked, productId])

  // A freshly-run analysis takes priority over whatever was already on record.
  const displayedAnalysis = analysisResult ?? existingAnalysis

  if (!authChecked || loading) {
    return (
      <AppLayout user={user}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-5 w-32 bg-gray-900 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="h-80 md:h-[420px] rounded-2xl bg-gray-900 border border-gray-800 mb-5 animate-pulse" />
              <div className="h-4 w-40 bg-gray-900 rounded mb-3 animate-pulse" />
              <div className="h-7 w-3/4 bg-gray-900 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-900 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-900 rounded animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
            </div>
          </div>
          <div className="h-64 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
        </div>
      </AppLayout>
    )
  }

  if (notFound || !product) {
    return (
      <AppLayout user={user}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-white font-bold text-xl mb-2">Product not found</h1>
          <p className="text-gray-500 text-sm mb-6">This product may have been removed.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>
      </AppLayout>
    )
  }

  const trend = trendConfig[product.trend_label] ?? trendConfig['Rising']
  const saved = savedIds.has(product.id)
  const launchoryScore = computeLaunchoryScore(product)
  const adActivityLevel = getAdActivityLevel(product.trend_label)
  const saturation = getSaturationInfo(product)

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

      {trackingProduct && (
        <TrackProductModal
          productTitle={trackingProduct.title}
          onClose={() => setTrackingProduct(null)}
          onSave={handleSaveTrack}
          saving={trackSaving}
        />
      )}

      <Toast message={toastMessage} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 text-gray-300 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors shrink-0"
          >
            {linkCopied ? (
              <>
                <Check size={15} className="text-emerald-400" />
                Link copied!
              </>
            ) : (
              <>
                <Share2 size={15} />
                Share
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="relative h-80 md:h-[420px] rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 mb-5">
              <Image src={product.image_url} alt={product.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
            </div>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.niche}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${trend.color}`}>
                {trend.icon}
                {product.trend_label}
              </span>
              {isTopInNiche && (product.trend_label === 'Hot' || product.trend_label === 'Trending') && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <TrendingUp size={12} />
                  Trending in {product.niche}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">{product.title}</h1>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={handleCopyTitle}
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                {titleCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {titleCopied ? 'Copied!' : 'Copy Product Title'}
              </button>
              <a
                href={buildSupplierLinks(product.title).aliexpress}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Search size={12} />
                Search on AliExpress
              </a>
            </div>

            <p className="text-gray-400 text-base leading-relaxed">{product.description}</p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center gap-5 lg:sticky lg:top-24">
              <div>
                <ScoreRing score={launchoryScore.score} size="xl" label="Launchory Score" />
                <p className="text-white text-sm font-semibold mt-2">{launchoryScore.label}</p>
              </div>

              <div className="w-full border-t border-gray-800 pt-4 text-left space-y-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Score breakdown</p>
                {[
                  { label: 'Demand', points: launchoryScore.demandPoints, of: 40 },
                  { label: 'Views', points: launchoryScore.viewsPoints, of: 30 },
                  { label: 'Saves', points: launchoryScore.savesPoints, of: 20 },
                  { label: 'Trend bonus', points: launchoryScore.trendPoints, of: 10 },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="text-gray-300 font-medium">
                      +{Math.round(row.points)} <span className="text-gray-600">/ {row.of}</span>
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={product.supplier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                <ExternalLink size={15} />
                View Supplier
              </a>

              {user ? (
                <>
                  <button
                    onClick={() => toggleSave(product.id)}
                    className={`w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-colors border ${
                      saved
                        ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/30'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    <Bookmark size={15} className={saved ? 'fill-indigo-400' : ''} />
                    {saved ? 'Saved' : 'Save Product'}
                  </button>
                  <button
                    onClick={() => setTrackingProduct(product)}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-colors border bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  >
                    <FlaskConical size={15} />
                    Track This Product
                  </button>
                </>
              ) : (
                <div className="relative w-full group">
                  <Link
                    href="/auth/signup"
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-colors border bg-gray-800/60 text-gray-500 border-gray-800"
                  >
                    <Lock size={14} />
                    Save Product
                  </Link>
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 border border-gray-700 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Sign up to save products
                  </span>
                </div>
              )}

              <div className="w-full border-t border-gray-800 pt-5">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Or search other suppliers</p>
                <SupplierQuickLinks title={product.title} className="flex flex-col gap-2" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={18} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">AI Analysis</h2>
          </div>

          {!user ? (
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-hidden">
              <div className="pointer-events-none select-none blur-sm opacity-50">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={15} className="text-indigo-400" />
                  <span className="text-white font-semibold text-sm">Ad Angles</span>
                </div>
                <div className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
                  <p className="text-gray-300 text-sm">
                    {product.niche} shoppers convert fastest on a &ldquo;stop scrolling, watch this&rdquo; hook &mdash; here&rsquo;s the exact angle.
                  </p>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60 backdrop-blur-[1px] p-6">
                <div className="text-center max-w-sm">
                  <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={22} className="text-indigo-400" />
                  </div>
                  <p className="text-white font-semibold mb-1.5">
                    Sign up free to see all 3 ad angles, hooks, target audience, and more
                  </p>
                  <p className="text-gray-500 text-sm mb-2">
                    Get instant demand scores, competition analysis, and ready-to-use ad angles for every product.
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-gray-500 text-xs mb-6">
                    <Users size={12} />
                    Join {ACTIVE_USER_COUNT} dropshippers already using Launchory
                  </p>
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
          ) : displayedAnalysis ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
              <AnalysisResultView result={displayedAnalysis} product={product} />
              <button
                onClick={() => analyzeProduct(product)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                Re-run analysis
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              {analysisError && !selectedProduct && (
                <div className="flex items-start gap-3 p-3.5 mb-5 bg-red-500/10 border border-red-500/30 rounded-xl text-left max-w-md mx-auto">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-sm">{analysisError}</p>
                </div>
              )}
              <p className="text-gray-400 text-sm mb-5">No analysis yet for this product.</p>
              <button
                onClick={() => analyzeProduct(product)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                <Zap size={15} />
                AI Analyze
              </button>
            </div>
          )}
        </div>

        {/* Market Saturation */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <Store size={18} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Market Saturation</h2>
          </div>
          <div className={`rounded-2xl border p-6 ${saturation.cardAccentClass}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${saturation.pillClass}`}>
                  🏪 {saturation.tier}
                </span>
                <p className="text-white font-semibold text-base mt-3">{saturation.rangeText}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{saturation.meaning}</p>
            <div className="flex items-start gap-3 p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
              <Lightbulb size={16} className={`${saturation.iconClass} mt-0.5 shrink-0`} />
              <p className="text-gray-300 text-sm leading-relaxed">{saturation.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Live Ads */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <ThumbsUp size={18} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Live Ads Running for This Product</h2>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-5">
              Based on our analysis, this product has{' '}
              <span className="font-semibold text-white">{adActivityLevel}</span> ad activity on Facebook and TikTok.
            </p>
            <AdSearchButtons title={product.title} />
            <div className="mt-5 flex items-start gap-3 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
              <Lightbulb size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="font-semibold text-white">Pro Tip:</span> Open the Facebook Ad Library, filter by your country, and look for ads that have been running for 30+ days — those are the profitable ones.
              </p>
            </div>
          </div>
        </div>

        {/* Profit calculator CTA */}
        <Link
          href={`/testing?tab=calculator&product=${encodeURIComponent(product.title)}&cost=${SUGGESTED_PRODUCT_COST}`}
          className="flex items-center gap-3 bg-gradient-to-r from-indigo-600/15 to-gray-900 border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl px-6 py-5 mb-12 transition-colors"
        >
          <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center shrink-0">
            <Calculator size={18} className="text-indigo-400" />
          </div>
          <p className="text-white text-sm font-medium">
            Want to know if this is profitable? Try our profit calculator &rarr;
          </p>
        </Link>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">
              {user ? `More in ${product.niche}` : 'More winning products'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((related) => (
                <ProductCard
                  key={related.id}
                  product={related}
                  saved={savedIds.has(related.id)}
                  onToggleSave={toggleSave}
                  onAnalyze={analyzeProduct}
                  onTrack={user ? setTrackingProduct : undefined}
                />
              ))}
            </div>
            {!user && (
              <div className="mt-6 bg-gradient-to-br from-indigo-600/15 to-gray-900 border border-indigo-500/30 rounded-2xl p-8 text-center">
                <p className="text-white font-semibold mb-1.5">See all 150+ winning products</p>
                <p className="text-gray-400 text-sm mb-5">
                  Sign up free to browse the full feed, run AI analysis, and generate ad creatives.
                </p>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        )}

        <RecentlyViewedRow products={recentlyViewed.filter((p) => p.id !== productId)} />
      </div>
    </AppLayout>
  )
}
