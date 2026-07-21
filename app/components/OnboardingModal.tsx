'use client'

import { useState } from 'react'
import { Rocket, Sprout, TrendingUp, Search, Zap, Bookmark, Check, ArrowRight } from 'lucide-react'

type Experience = 'beginner' | 'intermediate' | 'advanced'

const experienceOptions: { value: Experience; title: string; description: string }[] = [
  { value: 'beginner', title: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', title: 'Intermediate', description: 'Have made some sales' },
  { value: 'advanced', title: 'Advanced', description: 'Scaling existing store' },
]

const tips = [
  { icon: Search, title: 'Browse the daily feed', description: 'A fresh, curated list of winning products every day.' },
  { icon: Zap, title: 'Click AI Analyze', description: 'Get instant demand scores, ad angles, and hooks for any product.' },
  { icon: Bookmark, title: 'Save products to your board', description: 'Bookmark winners to revisit them anytime from Saved.' },
]

export function OnboardingModal({ niches, onComplete }: { niches: string[]; onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [selectedNiches, setSelectedNiches] = useState<Set<string>>(new Set())

  function toggleNiche(niche: string) {
    setSelectedNiches((prev) => {
      const next = new Set(prev)
      if (next.has(niche)) next.delete(niche)
      else next.add(niche)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-6 pt-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-indigo-500' : 'bg-gray-800'}`} />
          ))}
        </div>

        <div className="p-6">
          {step === 1 && (
            <>
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-5">
                <Rocket size={22} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Welcome to Launchory!</h2>
              <p className="text-gray-400 text-sm mb-6">What&apos;s your experience level?</p>

              <div className="space-y-3 mb-6">
                {experienceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition-colors ${
                      experience === opt.value
                        ? 'bg-indigo-600/15 border-indigo-500'
                        : 'bg-gray-800/60 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">{opt.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{opt.description}</p>
                    </div>
                    {experience === opt.value && (
                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!experience}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-5">
                <TrendingUp size={22} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">What niches are you interested in?</h2>
              <p className="text-gray-400 text-sm mb-6">Pick as many as you like — you can change this anytime.</p>

              <div className="grid grid-cols-2 gap-2.5 mb-6 max-h-60 overflow-y-auto">
                {niches.map((niche) => {
                  const selected = selectedNiches.has(niche)
                  return (
                    <button
                      key={niche}
                      onClick={() => toggleNiche(niche)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                        selected
                          ? 'bg-indigo-600/15 border-indigo-500'
                          : 'bg-gray-800/60 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'
                        }`}
                      >
                        {selected && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-gray-200 text-xs font-medium truncate">{niche}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-5">
                <Sprout size={22} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">You&apos;re all set!</h2>
              <p className="text-gray-400 text-sm mb-6">Here&apos;s how Launchory works.</p>

              <div className="space-y-3 mb-6">
                {tips.map((tip) => (
                  <div key={tip.title} className="flex items-start gap-3 p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
                    <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center shrink-0">
                      <tip.icon size={15} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{tip.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
