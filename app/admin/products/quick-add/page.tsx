'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'

const TREND_OPTIONS = ['Hot', 'Trending', 'Rising']

type AddedProduct = { title: string; niche: string; demand_score: number }

export default function QuickAddPage() {
  const { user, adminChecked } = useAdminGuard()
  const [url, setUrl] = useState('')
  const [demandScore, setDemandScore] = useState(85)
  const [trendLabel, setTrendLabel] = useState('Hot')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<AddedProduct[]>([])

  async function handleQuickAdd() {
    if (!url.trim()) return
    setSaving(true)
    setError(null)
    try {
      const importRes = await fetch('/api/admin/aliexpress-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const imported = await importRes.json().catch(() => null)
      if (!importRes.ok) {
        setError(
          imported?.error === 'invalid_aliexpress_url'
            ? 'That doesn’t look like an AliExpress product URL.'
            : 'Could not import this product. Please try again.'
        )
        return
      }
      if (!imported.image_url) {
        setError('Couldn’t detect a product image for this one — use the full Add Product form instead so you can set an image manually.')
        return
      }

      const createRes = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: imported.title,
          description: imported.description,
          image_url: imported.image_url,
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
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
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
            onKeyDown={(e) => e.key === 'Enter' && !saving && handleQuickAdd()}
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

        <button
          onClick={handleQuickAdd}
          disabled={saving || !url.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Importing &amp; saving…
            </>
          ) : (
            <>
              <Zap size={16} />
              Auto-fill &amp; Save
            </>
          )}
        </button>
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
