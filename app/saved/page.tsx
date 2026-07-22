'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bookmark, ArrowLeft } from 'lucide-react'
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

export default function SavedPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
    if (!user) return
    async function loadSaved() {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('saved_products')
        .select('product_id, products(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load saved products:', error.message)
        setLoading(false)
        return
      }

      const rows = (data ?? []) as unknown as { products: Product | null }[]
      setProducts(rows.map((row) => row.products).filter((p): p is Product => p !== null))
      setLoading(false)
    }
    loadSaved()
  }, [user])

  // Keep the grid in sync if a product is un-saved from this page.
  const visibleProducts = products.filter((p) => savedIds.has(p.id))

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Saved Products</h1>
        <p className="text-gray-400 mb-8">Products you&apos;ve bookmarked for later.</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={22} className="text-gray-600" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-1">No saved products yet</h2>
            <p className="text-gray-500 text-sm mb-6">Bookmark products from the dashboard to see them here.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
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
