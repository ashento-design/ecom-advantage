'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import type { Product } from '@/app/types'

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('products')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load products for search:', error.message)
        }
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.niche.toLowerCase().includes(q)
    )
  }, [query, products])

  function goToProduct(id: string) {
    onClose()
    router.push(`/products/${id}`)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <Search size={18} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name, niche, or description…"
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
          <button
            onClick={onClose}
            className="shrink-0 text-gray-500 hover:text-white text-xs border border-gray-700 rounded px-1.5 py-0.5 transition-colors"
          >
            Esc
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">Loading products…</div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No products found.</div>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onClick={() => goToProduct(p.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800/60 last:border-b-0"
              >
                <Image
                  src={p.image_url}
                  alt={p.title}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.title}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">{p.niche}</p>
                </div>
                <span className="text-xs font-bold text-white bg-gray-800 border border-gray-700 rounded-full px-2 py-1 shrink-0">
                  {p.demand_score}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
