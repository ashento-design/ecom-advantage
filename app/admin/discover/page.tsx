'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Compass, ArrowLeft, AlertCircle, Check, X, PenSquare, Sparkles, Loader2 } from 'lucide-react'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { createBrowserClient } from '@/app/lib/supabase'

const COUNT_OPTIONS = [3, 5, 10]

type DraftStatus = 'pending' | 'adding' | 'added' | 'skipped' | 'failed'

type DraftProduct = {
  title: string
  description: string
  niche: string
  demand_score: number
  trend_label: string
  image_url: string
  status: DraftStatus
}

export default function DiscoverProductsPage() {
  const { user, adminChecked } = useAdminGuard()
  const router = useRouter()

  const [niches, setNiches] = useState<string[]>([])
  const [niche, setNiche] = useState('')
  const [count, setCount] = useState(5)
  const [discovering, setDiscovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingAll, setAddingAll] = useState(false)
  const [drafts, setDrafts] = useState<DraftProduct[]>([])

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('products')
      .select('niche')
      .then(({ data }) => {
        const unique = Array.from(new Set((data ?? []).map((row) => row.niche as string))).sort()
        setNiches(unique)
        if (unique.length > 0) setNiche((prev) => prev || unique[0])
      })
  }, [])

  async function handleDiscover() {
    if (!niche) return
    setDiscovering(true)
    setError(null)
    setDrafts([])
    try {
      const res = await fetch('/api/admin/discover-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, count }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError('Could not discover products right now. Please try again.')
        return
      }
      setDrafts((data.products ?? []).map((p: Omit<DraftProduct, 'status'>) => ({ ...p, status: 'pending' as DraftStatus })))
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setDiscovering(false)
    }
  }

  async function addDraft(index: number) {
    const draft = drafts[index]
    if (!draft || draft.status === 'adding' || draft.status === 'added') return

    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, status: 'adding' } : d)))

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          image_url: draft.image_url,
          niche: draft.niche,
          supplier_url: '',
          demand_score: draft.demand_score,
          trend_label: draft.trend_label,
          is_featured: false,
        }),
      })
      if (!res.ok) throw new Error('failed')
      setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, status: 'added' } : d)))
    } catch {
      setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, status: 'failed' } : d)))
    }
  }

  function skipDraft(index: number) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, status: 'skipped' } : d)))
  }

  function editAndAdd(index: number) {
    const draft = drafts[index]
    if (!draft) return
    sessionStorage.setItem('launchoryDiscoveredDraft', JSON.stringify(draft))
    router.push('/admin/products/quick-add')
  }

  async function handleAddAll() {
    setAddingAll(true)
    for (let i = 0; i < drafts.length; i++) {
      if (drafts[i].status === 'pending' || drafts[i].status === 'failed') {
        // eslint-disable-next-line no-await-in-loop
        await addDraft(i)
      }
    }
    setAddingAll(false)
  }

  const addedCount = drafts.filter((d) => d.status === 'added').length
  const pendingCount = drafts.filter((d) => d.status === 'pending' || d.status === 'failed').length

  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AdminLayout user={user}>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Compass size={20} className="text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">Discover New Products</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">Let AI brainstorm winning product ideas for a niche, then review and add the ones worth keeping.</p>

      <div className="max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Niche</label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
            >
              {niches.length === 0 && <option value="">Loading niches…</option>}
              {niches.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-40">
            <label className="block text-sm font-medium text-gray-300 mb-2">Count</label>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                    count === c
                      ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <button
          onClick={handleDiscover}
          disabled={discovering || !niche}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {discovering ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI is finding winning products in {niche}…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Discover Products
            </>
          )}
        </button>
      </div>

      {drafts.length > 0 && (
        <div className="max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-white font-semibold text-sm">
              {addedCount} of {drafts.length} products added to feed
            </p>
            <button
              onClick={handleAddAll}
              disabled={addingAll || pendingCount === 0}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              {addingAll ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Check size={15} />
                  Add All
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft, i) => (
              <div
                key={i}
                className={`bg-gray-900 border rounded-2xl overflow-hidden transition-opacity ${
                  draft.status === 'skipped' ? 'border-gray-800 opacity-40' : 'border-gray-800'
                }`}
              >
                <div className="relative h-32 bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.image_url} alt={draft.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-950/80 text-gray-300 border border-gray-700">
                      {draft.trend_label}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-gray-950/80 border border-gray-700 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{draft.demand_score}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider font-medium mb-1">{draft.niche}</p>
                    <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{draft.title}</p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1.5 line-clamp-3">{draft.description}</p>
                  </div>

                  {draft.status === 'added' ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold py-2">
                      <Check size={14} />
                      Added to feed
                    </div>
                  ) : draft.status === 'skipped' ? (
                    <div className="text-gray-500 text-xs font-medium py-2">Skipped</div>
                  ) : (
                    <div className="space-y-2">
                      {draft.status === 'failed' && (
                        <p className="text-red-400 text-[11px]">Failed to add — try again.</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => addDraft(i)}
                          disabled={draft.status === 'adding'}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          {draft.status === 'adding' ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                          Add to Feed
                        </button>
                        <button
                          onClick={() => editAndAdd(i)}
                          className="inline-flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-2.5 rounded-lg transition-colors"
                          title="Edit & Add"
                        >
                          <PenSquare size={13} />
                        </button>
                        <button
                          onClick={() => skipDraft(i)}
                          className="inline-flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 text-xs font-semibold px-2.5 py-2.5 rounded-lg transition-colors"
                          title="Skip"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
