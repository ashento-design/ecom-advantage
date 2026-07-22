'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Zap, Bookmark, Flame, TrendingUp, ArrowUp, AlertCircle } from 'lucide-react'
import { SupplierQuickLinks } from '@/app/components/SupplierQuickLinks'
import { createBrowserClient } from '@/app/lib/supabase'
import { useSavedProducts } from '@/app/lib/useSavedProducts'
import { useProductAnalysis } from '@/app/lib/useProductAnalysis'
import { useToast } from '@/app/lib/useToast'
import { Navbar } from '@/app/components/Navbar'
import { ProductCard } from '@/app/components/ProductCard'
import { ScoreRing } from '@/app/components/ScoreRing'
import { AnalysisModal } from '@/app/components/AnalysisModal'
import { AnalysisResultView } from '@/app/components/AnalysisResultView'
import { UpgradeModal } from '@/app/components/UpgradeModal'
import { Toast } from '@/app/components/Toast'
import type { Product, AnalysisResult } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const trendConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Hot: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Flame size={13} /> },
  Trending: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <TrendingUp size={13} /> },
  Rising: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <ArrowUp size={13} /> },
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const productId = params.id
  const router = useRouter()

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [existingAnalysis, setExistingAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const { toastMessage, showToast } = useToast()
  const { savedIds, toggleSave } = useSavedProducts(user, showToast)
  const {
    selectedProduct, analysisResult, analysisLoading, analysisError,
    showUpgradeModal, upgrading, upgradeError,
    analyzeProduct, closeModal, setShowUpgradeModal, handleUpgrade,
  } = useProductAnalysis()

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
  }, [router])

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

      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('niche', productData.niche)
        .neq('id', productId)
        .limit(3)
      setRelatedProducts(related ?? [])

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar user={user} />
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
      </div>
    )
  }

  const trend = trendConfig[product.trend_label] ?? trendConfig['Rising']
  const saved = savedIds.has(product.id)

  return (
    <div className="min-h-screen bg-gray-950">
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

      <Toast message={toastMessage} />

      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="relative h-80 md:h-[420px] rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 mb-5">
              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.niche}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${trend.color}`}>
                {trend.icon}
                {product.trend_label}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug">{product.title}</h1>
            <p className="text-gray-400 text-base leading-relaxed">{product.description}</p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center gap-5 lg:sticky lg:top-24">
              <ScoreRing score={product.demand_score} size="xl" />

              <a
                href={product.supplier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                <ExternalLink size={15} />
                View Supplier
              </a>

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

          {displayedAnalysis ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
              <AnalysisResultView result={displayedAnalysis} />
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

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">More in {product.niche}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((related) => (
                <ProductCard
                  key={related.id}
                  product={related}
                  saved={savedIds.has(related.id)}
                  onToggleSave={toggleSave}
                  onAnalyze={analyzeProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
