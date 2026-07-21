import { DollarSign, Target, Megaphone } from 'lucide-react'
import { ScoreRing } from '@/app/components/ScoreRing'
import type { AnalysisResult } from '@/app/types'

const competitionConfig: Record<string, string> = {
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  return (
    <>
      {/* Score + Competition + Price row */}
      <div className="flex items-center gap-6 p-5 bg-gray-800/60 border border-gray-700 rounded-xl">
        <ScoreRing score={result.demand_score} size="lg" />
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Competition</span>
            <div className="mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${competitionConfig[result.competition_level] ?? competitionConfig['Medium']}`}>
                {result.competition_level}
              </span>
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Suggested Price</span>
            <div className="flex items-center gap-1.5 mt-1">
              <DollarSign size={14} className="text-green-400" />
              <span className="text-white font-bold text-base">{result.suggested_price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
      </div>

      {/* Ad Angles */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} className="text-indigo-400" />
          <span className="text-white font-semibold text-sm">Ad Angles</span>
        </div>
        <div className="space-y-2">
          {result.ad_angles.map((angle, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
              <span className="shrink-0 w-5 h-5 bg-indigo-600/30 text-indigo-400 rounded-md flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                {i + 1}
              </span>
              <p className="text-gray-300 text-sm leading-relaxed">{angle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hooks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Megaphone size={15} className="text-orange-400" />
          <span className="text-white font-semibold text-sm">Video Hooks</span>
        </div>
        <div className="space-y-2">
          {result.hooks.map((hook, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
              <span className="shrink-0 w-5 h-5 bg-orange-600/30 text-orange-400 rounded-md flex items-center justify-center text-xs font-bold border border-orange-500/30">
                {i + 1}
              </span>
              <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{hook}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
