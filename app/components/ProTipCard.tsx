import Link from 'next/link'
import { X, Zap } from 'lucide-react'

export function ProTipCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative flex items-start gap-3 bg-gradient-to-r from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-xl p-4 mb-8">
      <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center shrink-0">
        <Zap size={15} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">
          Pro tip: Pro users find winning products 3x faster with unlimited AI analyses.
        </p>
        <Link href="/account" className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold mt-1 inline-block transition-colors">
          Upgrade to Pro →
        </Link>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 w-6 h-6 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} className="text-gray-500" />
      </button>
    </div>
  )
}
