import Link from 'next/link'
import { Flame, TrendingUp, ArrowUp, Bookmark, ExternalLink, Zap } from 'lucide-react'
import { ScoreRing } from '@/app/components/ScoreRing'
import type { Product } from '@/app/types'

const trendConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Hot: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Flame size={12} /> },
  Trending: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <TrendingUp size={12} /> },
  Rising: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <ArrowUp size={12} /> },
}

function isNewProduct(createdAt: string) {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return Date.now() - new Date(createdAt).getTime() < sevenDaysMs
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-800" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-gray-800 rounded" />
            <div className="h-4 w-3/4 bg-gray-800 rounded" />
          </div>
          <div className="w-14 h-14 rounded-full bg-gray-800 shrink-0" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-gray-800 rounded" />
          <div className="h-3 w-2/3 bg-gray-800 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-800 rounded-xl" />
          <div className="w-10 h-10 bg-gray-800 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  )
}

export function ProductCard({
  product,
  saved,
  onToggleSave,
  onAnalyze,
}: {
  product: Product
  saved: boolean
  onToggleSave: (id: string) => void
  onAnalyze: (p: Product) => void
}) {
  const trend = trendConfig[product.trend_label] ?? trendConfig['Rising']
  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5">
      <div className="relative h-64 overflow-hidden bg-gray-800">
        <Link href={`/products/${product.id}`} className="absolute inset-0 block">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${trend.color}`}>
            {trend.icon}
            {product.trend_label}
          </span>
          {isNewProduct(product.created_at) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
              NEW
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave(product.id)
            }}
            className="w-8 h-8 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors border border-gray-700"
          >
            <Bookmark
              size={14}
              className={saved ? 'text-indigo-400 fill-indigo-400' : 'text-gray-400'}
            />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.niche}</span>
            <Link href={`/products/${product.id}`}>
              <h3 className="text-white font-semibold text-base mt-0.5 leading-snug hover:text-indigo-400 transition-colors">{product.title}</h3>
            </Link>
          </div>
          <ScoreRing score={product.demand_score} />
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{product.description}</p>
        <div className="flex gap-2">
          <button
            onClick={() => onAnalyze(product)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={14} />
            AI Analyze
          </button>
          <a
            href={product.supplier_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors border border-gray-700"
          >
            <ExternalLink size={14} className="text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  )
}
