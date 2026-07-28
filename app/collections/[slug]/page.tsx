'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, FolderOpen, Share2, Check, Bookmark, User } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { useSavedProducts } from '@/app/lib/useSavedProducts'
import { useProductAnalysis } from '@/app/lib/useProductAnalysis'
import { useToast } from '@/app/lib/useToast'
import { AppLayout } from '@/app/components/AppLayout'
import { ProductCard, ProductCardSkeleton } from '@/app/components/ProductCard'
import { AnalysisModal } from '@/app/components/AnalysisModal'
import { UpgradeModal } from '@/app/components/UpgradeModal'
import { Toast } from '@/app/components/Toast'
import type { Collection } from '@/app/lib/collections'
import type { Product } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function PublicCollectionPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [savingAll, setSavingAll] = useState(false)

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
      setUser(data.user ?? null)
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    if (!authChecked || !slug) return

    async function load() {
      const supabase = createBrowserClient()
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .single()

      // Visible if it's public, or the viewer is the owner looking at a
      // private collection (e.g. previewing before flipping it public).
      const visible = collectionData && (collectionData.is_public || collectionData.user_id === user?.id)
      if (collectionError || !visible) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setCollection(collectionData as Collection)

      if (collectionData.product_ids?.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .in('id', collectionData.product_ids)
        setProducts(productsData ?? [])
      }

      setLoading(false)
    }
    load()
  }, [authChecked, slug, user])

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  async function handleSaveAll() {
    if (!user || products.length === 0) return
    setSavingAll(true)
    const supabase = createBrowserClient()
    const { data: existing } = await supabase.from('saved_products').select('product_id').eq('user_id', user.id)
    const existingIds = new Set((existing ?? []).map((row) => row.product_id as string))
    const toInsert = products.filter((p) => !existingIds.has(p.id)).map((p) => ({ user_id: user.id, product_id: p.id }))

    if (toInsert.length > 0) {
      const { error } = await supabase.from('saved_products').insert(toInsert)
      if (error) {
        console.error('Failed to save collection to board:', error.message)
        setSavingAll(false)
        return
      }
    }
    setSavingAll(false)
    showToast(toInsert.length > 0 ? `Saved ${toInsert.length} product${toInsert.length === 1 ? '' : 's'} to your board` : 'Already on your board')
  }

  if (!authChecked || loading) {
    return (
      <AppLayout user={user}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-64 bg-gray-900 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  if (notFound || !collection) {
    return (
      <AppLayout user={user}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-white font-bold text-xl mb-2">Collection not found</h1>
          <p className="text-gray-500 text-sm mb-6">This collection may be private or no longer exists.</p>
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

      <Toast message={toastMessage} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={user ? '/' : '/landing'}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          {user ? 'Back to dashboard' : 'Back to home'}
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen size={16} className="text-indigo-400" />
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Collection</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{collection.name}</h1>
            {collection.description && (
              <p className="text-gray-400 text-sm max-w-xl mb-2">{collection.description}</p>
            )}
            {collection.creator_name && (
              <p className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
                <User size={12} />
                Curated by {collection.creator_name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <button
                onClick={handleSaveAll}
                disabled={savingAll || products.length === 0}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Bookmark size={15} />
                {savingAll ? 'Saving…' : 'Save all to my board'}
              </button>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 text-gray-300 text-sm font-medium px-3.5 py-2.5 rounded-xl transition-colors"
            >
              {linkCopied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
              {linkCopied ? 'Link copied!' : 'Share'}
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">This collection doesn&apos;t have any products yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
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

        {!user && (
          <div className="mt-10 bg-gradient-to-br from-indigo-600/15 to-gray-900 border border-indigo-500/30 rounded-2xl p-8 text-center">
            <p className="text-white font-semibold mb-1.5">See all 150+ winning products</p>
            <p className="text-gray-400 text-sm mb-5">
              Sign up free to save these products, run AI analysis, and build your own collections.
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
    </AppLayout>
  )
}
