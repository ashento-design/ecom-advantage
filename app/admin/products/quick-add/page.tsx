'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, CheckCircle2, AlertCircle, ArrowLeft, ImageIcon, Search, Loader2, Check } from 'lucide-react'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'

const TREND_OPTIONS = ['Hot', 'Trending', 'Rising']

type AddedProduct = { title: string; niche: string; demand_score: number }

type ImportedProduct = {
  title: string
  description: string
  image_url: string
  image_is_fallback: boolean
  niche: string
  supplier_url: string
}

type UnsplashSuggestion = { id: string; thumb: string; full: string; alt: string }

export default function QuickAddPage() {
  const { user, adminChecked } = useAdminGuard()
  const [url, setUrl] = useState('')
  const [demandScore, setDemandScore] = useState(85)
  const [trendLabel, setTrendLabel] = useState('Hot')
  const [importing, setImporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<AddedProduct[]>([])

  const [imported, setImported] = useState<ImportedProduct | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [manualImageUrl, setManualImageUrl] = useState('')
  const [unsplashResults, setUnsplashResults] = useState<UnsplashSuggestion[]>([])
  const [unsplashLoading, setUnsplashLoading] = useState(false)
  const [unsplashUnavailable, setUnsplashUnavailable] = useState(false)

  // Picks up a draft handed off from the Discover Products page ("Edit &
  // Add") instead of the normal paste-a-URL flow — skips straight to the
  // review step with the AI-generated fields already filled in.
  useEffect(() => {
    const raw = sessionStorage.getItem('launchoryDiscoveredDraft')
    if (!raw) return
    sessionStorage.removeItem('launchoryDiscoveredDraft')
    try {
      const draft = JSON.parse(raw)
      setImported({
        title: draft.title ?? '',
        description: draft.description ?? '',
        image_url: draft.image_url ?? '',
        image_is_fallback: false,
        niche: draft.niche ?? '',
        supplier_url: '',
      })
      setImageUrl(draft.image_url ?? '')
      if (draft.demand_score) setDemandScore(draft.demand_score)
      if (draft.trend_label && TREND_OPTIONS.includes(draft.trend_label)) setTrendLabel(draft.trend_label)
    } catch {
      // malformed payload — ignore, nothing to recover
    }
  }, [])

  function resetImportState() {
    setImported(null)
    setImageUrl('')
    setShowImageEditor(false)
    setManualImageUrl('')
    setUnsplashResults([])
    setUnsplashUnavailable(false)
  }

  async function handleImport() {
    if (!url.trim()) return
    setImporting(true)
    setError(null)
    resetImportState()
    try {
      const importRes = await fetch('/api/admin/aliexpress-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await importRes.json().catch(() => null)
      if (!importRes.ok) {
        setError(
          data?.error === 'invalid_aliexpress_url'
            ? 'That doesn’t look like an AliExpress product URL.'
            : 'Could not import this product. Please try again.'
        )
        return
      }

      setImported(data)
      setImageUrl(data.image_url)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  async function handleSave() {
    if (!imported) return
    setSaving(true)
    setError(null)
    try {
      const createRes = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: imported.title,
          description: imported.description,
          image_url: imageUrl,
          niche: imported.niche,
          supplier_url: imported.supplier_url,
          demand_score: demandScore,
          trend_label: trendLabel,
          is_featured: false,
        }),
      })
      const created = await createRes.json().catch(() => null)
      if (!createRes.ok) {
        setError(created?.error ?? 'Failed to save product.')
        return
      }

      setAdded((prev) => [{ title: imported.title, niche: imported.niche, demand_score: demandScore }, ...prev])
      setUrl('')
      resetImportState()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function searchUnsplash(query: string) {
    if (!query.trim()) return
    setUnsplashLoading(true)
    setUnsplashUnavailable(false)
    fetch(`/api/admin/unsplash-search?q=${encodeURIComponent(query)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          setUnsplashUnavailable(data?.error === 'not_configured')
          setUnsplashResults([])
          return
        }
        setUnsplashResults(Array.isArray(data?.results) ? data.results : [])
      })
      .catch(() => setUnsplashResults([]))
      .finally(() => setUnsplashLoading(false))
  }

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
        <Zap size={20} className="text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">Quick Add</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">Paste a link, set the score and trend, save — built for adding a lot of products fast.</p>

      <div className="max-w-xl bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">AliExpress URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !importing && handleImport()}
            placeholder="Paste AliExpress product URL…"
            autoFocus
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Demand Score</label>
            <span className="text-emerald-400 font-bold text-sm">{demandScore}</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={demandScore}
            onChange={(e) => setDemandScore(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Trend Label</label>
          <div className="flex gap-2">
            {TREND_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrendLabel(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  trendLabel === t
                    ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {!imported ? (
          <button
            onClick={handleImport}
            disabled={importing || !url.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Zap size={16} />
                Auto-fill
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4 border-t border-gray-800 pt-5">
            <div className="flex gap-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={imported.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium leading-snug line-clamp-2">{imported.title}</p>
                <p className="text-gray-500 text-xs mt-1">{imported.niche}</p>
                {imported.image_is_fallback && (
                  <p className="text-amber-400/80 text-[11px] mt-1">Using a stock image — no product photo was found.</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowImageEditor((v) => !v)
                if (!unsplashResults.length && !unsplashLoading) searchUnsplash(imported.title)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              <ImageIcon size={13} />
              Change Image
            </button>

            {showImageEditor && (
              <div className="space-y-3 bg-gray-800/50 border border-gray-700 rounded-xl p-3.5">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="Paste an image URL…"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => manualImageUrl.trim() && setImageUrl(manualImageUrl.trim())}
                    disabled={!manualImageUrl.trim()}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Use
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => searchUnsplash(imported.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    <Search size={12} />
                    Search Unsplash for &ldquo;{imported.title}&rdquo;
                  </button>
                  {unsplashLoading && <Loader2 size={12} className="text-gray-500 animate-spin" />}
                </div>

                {unsplashUnavailable ? (
                  <p className="text-[11px] text-gray-500">Unsplash suggestions aren&rsquo;t configured.</p>
                ) : unsplashResults.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {unsplashResults.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setImageUrl(s.full)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          imageUrl === s.full ? 'border-emerald-500' : 'border-transparent hover:border-gray-600'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.thumb} alt={s.alt} className="w-full h-full object-cover" />
                        {imageUrl === s.full && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUrl('')
                  resetImportState()
                }}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {added.length > 0 && (
        <div className="max-w-xl">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">
            Added this session ({added.length})
          </p>
          <div className="space-y-2">
            {added.map((p, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{p.title}</p>
                  <p className="text-gray-500 text-xs">{p.niche} · Demand {p.demand_score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
