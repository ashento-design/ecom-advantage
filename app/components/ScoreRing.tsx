'use client'

import { useEffect, useState } from 'react'

export function ScoreRing({ score, size = 'sm', animate = false, label = 'demand' }: { score: number; size?: 'sm' | 'lg' | 'xl'; animate?: boolean; label?: string }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (!animate) return

    // Intentionally not resetting animatedScore to 0 here — the initial
    // useState(0) already covers first mount, and this effect only
    // re-fires if score/animate change, which doesn't happen during a
    // single modal's lifetime in practice.
    const durationMs = 800
    const stepMs = 20
    const steps = Math.max(1, Math.round(durationMs / stepMs))
    let step = 0

    const interval = setInterval(() => {
      step += 1
      const progress = Math.min(step / steps, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress >= 1) clearInterval(interval)
    }, stepMs)

    return () => clearInterval(interval)
  }, [score, animate])

  const displayScore = animate ? animatedScore : score

  const color = score >= 85 ? '#ef4444' : score >= 70 ? '#f97316' : '#3b82f6'
  const dim = size === 'xl' ? 'w-32 h-32' : size === 'lg' ? 'w-24 h-24' : 'w-14 h-14'
  const textSize = size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : 'text-sm'
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative ${dim} rounded-full flex items-center justify-center transition-[background] duration-100`}
        style={{ background: `conic-gradient(${color} ${displayScore * 3.6}deg, #1f2937 0deg)` }}
      >
        <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
          <span className={`${textSize} font-bold text-white`}>{displayScore}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
