'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/app/lib/supabase'
import { AlertCircle, ImageOff } from 'lucide-react'

export type ProductFormValues = {
  title: string
  description: string
  image_url: string
  niche: string
  supplier_url: string
  demand_score: number
  trend_label: string
  is_featured: boolean
}

const CUSTOM_NICHE = '__custom__'
const TREND_OPTIONS = ['Hot', 'Trending', 'Rising']

export function ProductForm({
  initialValues,
  onSubmit,
  submitting,
  submitLabel,
  error,
}: {
  initialValues?: Partial<ProductFormValues>
  onSubmit: (values: ProductFormValues) => void
  submitting: boolean
  submitLabel: string
  error: string | null
}) {
  const [niches, setNiches] = useState<string[]>([])
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url ?? '')
  const [imageError, setImageError] = useState(false)
  const [supplierUrl, setSupplierUrl] = useState(initialValues?.supplier_url ?? '')
  const [demandScore, setDemandScore] = useState(initialValues?.demand_score ?? 75)
  const [trendLabel, setTrendLabel] = useState(initialValues?.trend_label ?? 'Rising')
  const [isFeatured, setIsFeatured] = useState(initialValues?.is_featured ?? false)

  const [nicheSelectValue, setNicheSelectValue] = useState(initialValues?.niche ?? '')
  const [customNiche, setCustomNiche] = useState('')
  const [useCustomNiche, setUseCustomNiche] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('products')
      .select('niche')
      .then(({ data }) => {
        const unique = Array.from(new Set((data ?? []).map((row) => row.niche as string))).sort()
        setNiches(unique)
      })
  }, [])

  function handleNicheSelectChange(value: string) {
    if (value === CUSTOM_NICHE) {
      setUseCustomNiche(true)
      setNicheSelectValue(value)
    } else {
      setUseCustomNiche(false)
      setNicheSelectValue(value)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const niche = useCustomNiche ? customNiche.trim() : nicheSelectValue
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl.trim(),
      niche,
      supplier_url: supplierUrl.trim(),
      demand_score: demandScore,
      trend_label: trendLabel,
      is_featured: isFeatured,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Electric Mini Vegetable Chopper"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Realistic, benefit-driven description…"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => { setImageUrl(e.target.value); setImageError(false) }}
          required
          placeholder="https://images.unsplash.com/photo-…?w=400"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm mb-3"
        />
        <div className="w-full h-40 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <ImageOff size={22} />
              <span className="text-xs">{imageUrl ? 'Could not load image' : 'Image preview'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Niche</label>
          <select
            value={nicheSelectValue}
            onChange={(e) => handleNicheSelectChange(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
          >
            <option value="" disabled>Select a niche</option>
            {niches.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
            <option value={CUSTOM_NICHE}>+ Add new niche</option>
          </select>
          {useCustomNiche && (
            <input
              type="text"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              required
              placeholder="New niche name"
              className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Trend Label</label>
          <select
            value={trendLabel}
            onChange={(e) => setTrendLabel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
          >
            {TREND_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Supplier URL</label>
        <input
          type="url"
          value={supplierUrl}
          onChange={(e) => setSupplierUrl(e.target.value)}
          required
          placeholder="https://www.aliexpress.com/…"
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

      <div className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
        <div>
          <p className="text-white text-sm font-medium">Featured</p>
          <p className="text-gray-500 text-xs">Show this product as a staff pick</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFeatured(!isFeatured)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isFeatured ? 'bg-emerald-600' : 'bg-gray-700'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isFeatured ? 'translate-x-5' : ''}`}
          />
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}
