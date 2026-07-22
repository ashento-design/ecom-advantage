import { X, Zap, AlertCircle } from 'lucide-react'
import { AnalysisResultView } from '@/app/components/AnalysisResultView'
import { AdGenerator } from '@/app/components/AdGenerator'
import { SupplierQuickLinks } from '@/app/components/SupplierQuickLinks'
import type { Product, AnalysisResult } from '@/app/types'

export function AnalysisModal({
  product,
  result,
  loading,
  error,
  onClose,
  onAdLimitReached,
}: {
  product: Product
  result: AnalysisResult | null
  loading: boolean
  error: string | null
  onClose: () => void
  onAdLimitReached: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 pb-4 bg-gray-900 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-indigo-400" />
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">AI Analysis</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-snug">{product.title}</h2>
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">{product.niche}</span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-700"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 pt-5 space-y-6">
          {loading && (
            <div className="space-y-4">
              <div className="flex justify-center py-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm">Analyzing with AI…</span>
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && !loading && (
            <>
              <AnalysisResultView result={result} />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Find this product from a supplier</p>
                <SupplierQuickLinks title={product.title} />
              </div>
              <AdGenerator product={product} adAngles={result.ad_angles} onLimitReached={onAdLimitReached} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
