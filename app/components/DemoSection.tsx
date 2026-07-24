'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Flame, Zap, Bookmark, Target, Megaphone, DollarSign, Sparkles, Download, RotateCw, Eye,
} from 'lucide-react'
import { ScoreRing } from '@/app/components/ScoreRing'

const TABS = ['Find Winners', 'AI Analyze', 'Generate Ad'] as const
const AUTO_ADVANCE_MS = 4000

const demoProducts = [
  {
    title: 'Foldable Under-Desk Treadmill',
    niche: 'Fitness & Wellness',
    trend: 'Hot',
    score: 94,
    views: 312,
    image: 'https://images.unsplash.com/photo-1723468353356-e18254cd8a63?w=400',
  },
  {
    title: 'LED Facial Light Therapy Mask',
    niche: 'Beauty & Skincare',
    trend: 'Hot',
    score: 93,
    views: 287,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400',
  },
  {
    title: 'Adjustable Dumbbell Set',
    niche: 'Fitness',
    trend: 'Hot',
    score: 92,
    views: 204,
    image: 'https://images.unsplash.com/photo-1703668984128-b506579acdd2?w=400',
  },
]

const analyzedProduct = demoProducts[1]
const adAngles = [
  'Glow up your skincare routine in 10 minutes a day',
  'The at-home facial that costs less than one spa visit',
  'Dermatologist-inspired red light therapy without the appointment',
]
const hooks = [
  'This $49 mask replaced my $200 facials',
  "POV: you just found the skincare hack everyone's hiding",
  'I tried red light therapy for 30 days — here\'s what happened',
]

function FindWinnersDemo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-6 h-full">
      {demoProducts.map((p) => (
        <div key={p.title} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="relative h-20 sm:h-24 bg-gray-800 shrink-0">
            <Image src={p.image} alt={p.title} fill sizes="200px" className="object-cover" unoptimized />
            <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              <Flame size={8} />
              {p.trend}
            </span>
            <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
              <Bookmark size={9} className="text-gray-400" />
            </span>
          </div>
          <div className="p-2.5 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0">
                <p className="text-gray-500 text-[9px] font-medium uppercase tracking-wider truncate">{p.niche}</p>
                <p className="text-white text-[11px] font-semibold leading-snug mt-0.5 truncate">{p.title}</p>
                <span className="inline-flex items-center gap-0.5 text-[9px] text-gray-600 mt-1">
                  <Eye size={8} />
                  {p.views}
                </span>
              </div>
              <div className="shrink-0 scale-[0.6] origin-top-right -mr-2 -mt-1">
                <ScoreRing score={p.score} />
              </div>
            </div>
            <div className="mt-auto flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-medium py-1.5 rounded-lg justify-center">
              <Zap size={9} />
              AI Analyze
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AiAnalyzeDemo() {
  return (
    <div className="flex items-center justify-center h-full p-4 sm:p-6">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Zap size={12} className="text-indigo-400" />
          <span className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider">AI Analysis</span>
        </div>
        <p className="text-white text-xs font-semibold mb-3 truncate">{analyzedProduct.title}</p>

        <div className="flex items-center gap-4 p-3 bg-gray-800/60 border border-gray-700 rounded-lg mb-3">
          <div className="scale-90 origin-left">
            <ScoreRing score={analyzedProduct.score} size="lg" animate />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 w-fit">
              Medium Competition
            </span>
            <div className="flex items-center gap-1">
              <DollarSign size={10} className="text-emerald-400" />
              <span className="text-white text-[11px] font-bold">$39.99-$59.99</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <Target size={10} className="text-indigo-400" />
          <span className="text-white text-[10px] font-semibold">Ad Angles</span>
        </div>
        <div className="space-y-1.5 mb-3">
          {adAngles.map((angle, i) => (
            <div key={angle} className="flex items-start gap-2 p-2 bg-gray-800/60 border border-gray-700/60 rounded-lg">
              <span className="shrink-0 w-3.5 h-3.5 bg-indigo-600/30 text-indigo-400 rounded flex items-center justify-center text-[8px] font-bold">{i + 1}</span>
              <p className="text-gray-300 text-[10px] leading-snug">{angle}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <Megaphone size={10} className="text-orange-400" />
          <span className="text-white text-[10px] font-semibold">Video Hooks</span>
        </div>
        <div className="space-y-1.5">
          {hooks.map((hook, i) => (
            <div key={hook} className="flex items-start gap-2 p-2 bg-gray-800/60 border border-gray-700/60 rounded-lg">
              <span className="shrink-0 w-3.5 h-3.5 bg-orange-600/30 text-orange-400 rounded flex items-center justify-center text-[8px] font-bold">{i + 1}</span>
              <p className="text-gray-300 text-[10px] italic leading-snug">&ldquo;{hook}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GenerateAdDemo() {
  return (
    <div className="flex items-center justify-center h-full p-4 sm:p-6">
      <div className="w-full max-w-sm grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <p className="text-gray-500 text-[9px] uppercase tracking-wider font-medium mb-1.5">Selected angle</p>
          <div className="p-2 rounded-lg border border-indigo-500 bg-indigo-600/15 text-[10px] text-white mb-3">
            {adAngles[0]}
          </div>
          <p className="text-gray-500 text-[9px] uppercase tracking-wider font-medium mb-1.5">Format &amp; style</p>
          <div className="flex gap-1.5">
            <span className="px-2 py-1 rounded-lg border border-indigo-500 bg-indigo-600/15 text-[9px] text-white font-medium">Square</span>
            <span className="px-2 py-1 rounded-lg border border-indigo-500 bg-indigo-600/15 text-[9px] text-white font-medium">Bold</span>
          </div>
        </div>
        <div>
          <div className="relative h-32 rounded-xl bg-gradient-to-br from-indigo-600/40 via-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mb-2">
            <Sparkles size={24} className="text-indigo-400/60" />
            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-gray-950/80 text-white border border-gray-700">
              Square
            </span>
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-indigo-600/80 text-white">
              Bold
            </span>
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 inline-flex items-center justify-center gap-1 bg-indigo-600 text-white text-[9px] font-medium py-1.5 rounded-lg">
              <Download size={9} />
              Download Ad
            </div>
            <div className="flex-1 inline-flex items-center justify-center gap-1 bg-gray-800 border border-gray-700 text-white text-[9px] font-medium py-1.5 rounded-lg">
              <RotateCw size={9} />
              Generate Another
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DemoSection() {
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((t) => (t + 1) % TABS.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [activeTab])

  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">See Launchory in action</h2>
        <p className="text-gray-400">Click through the actual product research workflow.</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              activeTab === i
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="absolute inset-0 bg-indigo-600/10 blur-3xl rounded-2xl" aria-hidden />
        <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800 bg-gray-950/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="ml-3 text-gray-500 text-xs">launchory.io</span>
          </div>

          <div className="relative min-h-[22rem] sm:min-h-[26rem]">
            <div key={activeTab} className="absolute inset-0 animate-[fadeIn_0.4s_ease-out]">
              {activeTab === 0 && <FindWinnersDemo />}
              {activeTab === 1 && <AiAnalyzeDemo />}
              {activeTab === 2 && <GenerateAdDemo />}
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-800">
            {TABS.map((tab, i) => (
              <div key={tab} className="flex-1">
                <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full bg-indigo-500 ${
                      i < activeTab ? 'w-full' :
                      i === activeTab ? `w-full transition-[width] ease-linear` : 'w-0'
                    }`}
                    style={i === activeTab ? { transitionDuration: `${AUTO_ADVANCE_MS}ms` } : undefined}
                  />
                </div>
              </div>
            ))}
          </div>
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
