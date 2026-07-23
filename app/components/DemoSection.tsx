'use client'

import { useEffect, useState } from 'react'
import { Play, RotateCw, Flame, Zap, Sparkles, Target, Megaphone } from 'lucide-react'

const STEP_DURATION_MS = 3000

const steps = [
  { label: 'Browse the feed' },
  { label: 'AI analyzes the product' },
  { label: 'Generate an ad creative' },
]

function FeedMockup() {
  return (
    <div className="grid grid-cols-3 gap-3 p-6 h-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-800/80 border border-gray-700 rounded-xl overflow-hidden">
          <div className="h-14 bg-gradient-to-br from-indigo-600/30 to-gray-800 flex items-center justify-center relative">
            {i === 1 && (
              <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                <Flame size={8} />
                Hot
              </span>
            )}
          </div>
          <div className="p-2 space-y-1.5">
            <div className="h-1.5 w-3/4 bg-gray-700 rounded" />
            <div className="h-1.5 w-1/2 bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalyzeMockup() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-[220px] bg-gray-800/90 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Zap size={12} className="text-indigo-400" />
          <span className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider">AI Analysis</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'conic-gradient(#ef4444 338deg, #1f2937 0deg)' }}
          >
            <div className="absolute inset-0.5 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">94</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="h-1.5 w-full bg-gray-700 rounded" />
            <div className="h-1.5 w-2/3 bg-gray-700 rounded" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Target size={10} className="text-indigo-400 shrink-0" />
            <div className="h-1.5 flex-1 bg-gray-700 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <Megaphone size={10} className="text-orange-400 shrink-0" />
            <div className="h-1.5 flex-1 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

function AdGeneratorMockup() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-[220px]">
        <div className="relative h-28 rounded-xl bg-gradient-to-br from-indigo-600/40 via-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mb-3">
          <Sparkles size={22} className="text-indigo-400/60" />
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-gray-950/80 text-white border border-gray-700">
            Square
          </span>
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-600/80 text-white">
            Bold
          </span>
        </div>
        <div className="w-full bg-indigo-600 text-white text-[11px] font-medium py-2 rounded-lg text-center">
          Download Ad
        </div>
      </div>
    </div>
  )
}

export function DemoSection() {
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!playing) return
    if (step >= steps.length - 1) return
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_DURATION_MS)
    return () => clearTimeout(timer)
  }, [playing, step])

  function handlePlay() {
    setStep(0)
    setPlaying(true)
  }

  const finished = playing && step === steps.length - 1

  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">See Launchory in action</h2>
        <p className="text-gray-400">A 9-second look at going from feed to finished ad.</p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="absolute inset-0 bg-indigo-600/10 blur-3xl rounded-2xl" aria-hidden />
        <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800 bg-gray-950/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="ml-3 text-gray-500 text-xs">launchory.app</span>
          </div>

          <div className="relative h-72 sm:h-80">
            {!playing ? (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center bg-gray-950/40 group"
              >
                <span className="w-16 h-16 rounded-full bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-colors">
                  <Play size={24} className="text-white ml-1" fill="currentColor" />
                </span>
              </button>
            ) : (
              <>
                <div key={step} className="absolute inset-0 animate-[fadeIn_0.4s_ease-out]">
                  {step === 0 && <FeedMockup />}
                  {step === 1 && <AnalyzeMockup />}
                  {step === 2 && <AdGeneratorMockup />}
                </div>
                {finished && (
                  <button
                    onClick={handlePlay}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-gray-800/90 hover:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
                  >
                    <RotateCw size={11} />
                    Replay
                  </button>
                )}
              </>
            )}
          </div>

          {playing && (
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-800">
              {steps.map((s, i) => (
                <div key={s.label} className="flex-1">
                  <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full bg-indigo-500 ${i < step ? 'w-full' : i === step ? 'w-full transition-[width] duration-[3000ms] ease-linear' : 'w-0'}`}
                    />
                  </div>
                  <p className="text-gray-500 text-[10px] mt-1.5 hidden sm:block">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-8">
        Or just start for free — no credit card required.
      </p>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  )
}
