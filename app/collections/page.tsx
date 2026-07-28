'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, FolderOpen, Plus, Globe, Lock, Trash2, Check, Copy, ChevronDown,
} from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { useToast } from '@/app/lib/useToast'
import { AppLayout } from '@/app/components/AppLayout'
import { Toast } from '@/app/components/Toast'
import { CreateCollectionModal } from '@/app/components/CreateCollectionModal'
import { updateCollection, deleteCollection, type Collection } from '@/app/lib/collections'
import type { Product } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

function CollectionCard({
  collection,
  savedProducts,
  onChanged,
  showToast,
}: {
  collection: Collection
  savedProducts: Product[]
  onChanged: () => void
  showToast: (m: string) => void
}) {
  const [managingProducts, setManagingProducts] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleTogglePublic() {
    const { error } = await updateCollection(collection.id, { is_public: !collection.is_public })
    if (error) {
      console.error('Failed to update collection visibility:', error.message)
      return
    }
    onChanged()
  }

  async function handleToggleProduct(productId: string) {
    const has = collection.product_ids.includes(productId)
    const next = has
      ? collection.product_ids.filter((id) => id !== productId)
      : [...collection.product_ids, productId]
    const { error } = await updateCollection(collection.id, { product_ids: next })
    if (error) {
      console.error('Failed to update collection products:', error.message)
      return
    }
    onChanged()
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${collection.name}"? This can't be undone.`)) return
    const { error } = await deleteCollection(collection.id)
    if (error) {
      console.error('Failed to delete collection:', error.message)
      return
    }
    showToast('Collection deleted')
    onChanged()
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/collections/${collection.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-base truncate">{collection.name}</h3>
          {collection.description && (
            <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{collection.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
          aria-label="Delete collection"
          title="Delete collection"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <span className="text-gray-500 text-xs">{collection.product_ids.length} products</span>
        <button
          onClick={handleTogglePublic}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
            collection.is_public
              ? 'bg-green-500/15 text-green-400 border-green-500/30'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
        >
          {collection.is_public ? <Globe size={11} /> : <Lock size={11} />}
          {collection.is_public ? 'Public' : 'Private'}
        </button>
      </div>

      {collection.is_public && (
        <button
          onClick={handleCopyLink}
          className="w-full inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-medium px-3 py-2 rounded-lg transition-colors mb-3"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? 'Link copied!' : `/collections/${collection.slug}`}
        </button>
      )}

      <button
        onClick={() => setManagingProducts((v) => !v)}
        className="w-full flex items-center justify-between text-gray-400 hover:text-white text-xs font-medium transition-colors pt-2 border-t border-gray-800"
      >
        Manage products
        <ChevronDown size={13} className={`transition-transform ${managingProducts ? 'rotate-180' : ''}`} />
      </button>

      {managingProducts && (
        <div className="mt-3 max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {savedProducts.length === 0 ? (
            <p className="text-gray-600 text-xs py-2">Save products from the dashboard first, then add them here.</p>
          ) : (
            savedProducts.map((product) => {
              const checked = collection.product_ids.includes(product.id)
              return (
                <button
                  key={product.id}
                  onClick={() => handleToggleProduct(product.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors ${
                    checked ? 'bg-indigo-600/15 border-indigo-500/30' : 'bg-gray-800/60 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'}`}>
                    {checked && <Check size={11} className="text-white" />}
                  </span>
                  <span className="text-gray-300 text-xs truncate">{product.title}</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function CollectionsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [savedProducts, setSavedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()
  const { toastMessage, showToast } = useToast()

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth/login')
        return
      }
      setUser(data.user)
      setAuthChecked(true)
    })
  }, [router])

  async function loadData() {
    if (!user) return
    const supabase = createBrowserClient()

    const [collectionsRes, savedRes] = await Promise.all([
      supabase.from('collections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('saved_products').select('product_id, products(*)').eq('user_id', user.id),
    ])

    if (collectionsRes.error) {
      console.error('Failed to load collections:', collectionsRes.error.message)
    } else {
      setCollections((collectionsRes.data ?? []) as unknown as Collection[])
    }

    if (savedRes.error) {
      console.error('Failed to load saved products:', savedRes.error.message)
    } else {
      const rows = (savedRes.data ?? []) as unknown as { products: Product | null }[]
      setSavedProducts(rows.map((row) => row.products).filter((p): p is Product => p !== null))
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    Promise.resolve().then(() => loadData())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppLayout user={user}>
      <Toast message={toastMessage} />

      {showCreateModal && user && (
        <CreateCollectionModal
          userId={user.id}
          creatorName={(user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? user.email?.split('@')[0] ?? ''}
          availableProducts={[]}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            showToast('Collection created')
            loadData()
          }}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <FolderOpen size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">My Collections</h1>
            </div>
            <p className="text-gray-500 text-sm">Curate and share lists of winning products.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Create Collection
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={22} className="text-gray-600" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-1">No collections yet</h2>
            <p className="text-gray-500 text-sm mb-6">Group your saved products into a shareable list.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={15} />
              Create Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                savedProducts={savedProducts}
                onChanged={loadData}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
