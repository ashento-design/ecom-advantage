import { DollarSign, Target, Megaphone, Users, Share2, Calendar, Sparkles } from 'lucide-react'
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

      {/* Target audience + seasonality */}
      {(result.target_audience || result.seasonality) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.target_audience && (
            <div className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Users size={14} className="text-indigo-400" />
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Target Audience</span>
              </div>
              <p className="text-gray-300 text-sm">{result.target_audience}</p>
            </div>
          )}
          {result.seasonality && (
            <div className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar size={14} className="text-indigo-400" />
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Seasonality</span>
              </div>
              <p className="text-gray-300 text-sm">{result.seasonality}</p>
            </div>
          )}
        </div>
      )}

      {/* Best platforms */}
      {result.best_platforms && result.best_platforms.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Share2 size={15} className="text-indigo-400" />
            <span className="text-white font-semibold text-sm">Best Platforms</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.best_platforms.map((platform) => (
              <span
                key={platform}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wow factor */}
      {result.wow_factor && (
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-xl">
          <Sparkles size={16} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-gray-300 text-sm leading-relaxed">
            <span className="text-white font-semibold">Wow factor: </span>
            {result.wow_factor}
          </p>
        </div>
      )}
    </>
  )
}
