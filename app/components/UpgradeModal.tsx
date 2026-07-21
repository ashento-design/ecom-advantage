import { X, Zap, Check, AlertCircle } from 'lucide-react'

export function UpgradeModal({
  onClose,
  onUpgrade,
  upgrading,
  error,
}: {
  onClose: () => void
  onUpgrade: () => void
  upgrading: boolean
  error: string | null
}) {
  const perks = ['Unlimited AI analyses', 'Full product feed', 'Breakout alerts', 'Priority support']
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-700"
        >
          <X size={16} className="text-gray-400" />
        </button>

        <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <Zap size={26} className="text-indigo-400" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">You&apos;ve reached your free limit</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          You&apos;ve used all 3 of your free AI analyses. Upgrade to Pro for unlimited analyses, full product access, and more.
        </p>

        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-6 text-left space-y-2.5">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-indigo-600/30 flex items-center justify-center shrink-0">
                <Check size={10} className="text-indigo-400" />
              </div>
              <span className="text-gray-300 text-sm">{perk}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3.5 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-left">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={onUpgrade}
          disabled={upgrading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
        >
          {upgrading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Redirecting…
            </>
          ) : (
            'Upgrade to Pro - $29/month'
          )}
        </button>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
