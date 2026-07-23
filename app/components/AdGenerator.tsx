'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, Download, RotateCw, AlertCircle } from 'lucide-react'
import type { Product, AdFormat, AdStyle } from '@/app/types'

const FORMATS: { value: AdFormat; label: string; hint: string }[] = [
  { value: 'square', label: 'Square', hint: '1:1 · Instagram/Facebook' },
  { value: 'vertical', label: 'Vertical', hint: '9:16 · TikTok/Stories' },
  { value: 'horizontal', label: 'Horizontal', hint: '16:9 · YouTube' },
]

const STYLES: { value: AdStyle; label: string }[] = [
  { value: 'clean', label: 'Clean Product Shot' },
  { value: 'lifestyle', label: 'Lifestyle Scene' },
  { value: 'bold', label: 'Bold Text Focus' },
  { value: 'minimalist', label: 'Minimalist' },
]

const FORMAT_LABEL: Record<AdFormat, string> = {
  square: 'Square',
  vertical: 'Vertical',
  horizontal: 'Horizontal',
}

const STYLE_LABEL: Record<AdStyle, string> = {
  clean: 'Clean Product Shot',
  lifestyle: 'Lifestyle Scene',
  bold: 'Bold Text Focus',
  minimalist: 'Minimalist',
}

const STILL_WORKING_MS = 15_000

const AD_ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Please sign in to generate an ad.',
  profile_not_found: 'We couldn’t find your account. Try refreshing the page.',
  invalid_request_body: 'Something went wrong sending that request. Please try again.',
  ad_generation_failed: 'Ad generation failed. Please try again in a moment.',
  server_misconfigured: 'Ad generation is not fully configured yet on the server.',
}

function friendlyAdError(code: string | undefined) {
  if (!code) return 'Something went wrong. Please try again.'
  return AD_ERROR_MESSAGES[code] ?? code
}

export function AdGenerator({
  product,
  adAngles,
  onLimitReached,
}: {
  product: Product
  adAngles: string[]
  onLimitReached: () => void
}) {
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null)
  const [format, setFormat] = useState<AdFormat>('square')
  const [style, setStyle] = useState<AdStyle>('clean')
  const [generating, setGenerating] = useState(false)
  const [stillWorking, setStillWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedAd, setGeneratedAd] = useState<{ image_url: string; persisted?: boolean; format: AdFormat; style: AdStyle } | null>(null)
  const stillWorkingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (stillWorkingTimer.current) clearTimeout(stillWorkingTimer.current)
    }
  }, [])

  async function handleGenerate() {
    if (!selectedAngle) return
    setGenerating(true)
    setStillWorking(false)
    setError(null)
    stillWorkingTimer.current = setTimeout(() => setStillWorking(true), STILL_WORKING_MS)
    try {
      const res = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          title: product.title,
          description: product.description,
          ad_angle: selectedAngle,
          format,
          style,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.status === 403 && data?.error === 'limit_reached') {
        onLimitReached()
        return
      }
      if (!res.ok) {
        setError(friendlyAdError(data?.error))
        return
      }
      setGeneratedAd({ ...data, format, style })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
      setStillWorking(false)
      if (stillWorkingTimer.current) clearTimeout(stillWorkingTimer.current)
    }
  }

  function handleGenerateAnother() {
    setGeneratedAd(null)
    setError(null)
  }

  return (
    <div className="border-t border-gray-800 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-indigo-400" />
        <span className="text-white font-semibold text-sm">Generate Ad Creative</span>
      </div>

      {generatedAd ? (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
            <img src={generatedAd.image_url} alt="Generated ad creative" className="w-full h-auto max-h-[520px] object-contain" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-950/80 backdrop-blur-sm text-white border border-gray-700">
                {FORMAT_LABEL[generatedAd.format]}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/80 backdrop-blur-sm text-white border border-indigo-500/50">
                {STYLE_LABEL[generatedAd.style]}
              </span>
            </div>
          </div>
          {generatedAd.persisted === false && (
            <div className="flex items-start gap-3 p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <AlertCircle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-yellow-400 text-sm">
                This image wasn&apos;t saved to your account — download it now, since it won&apos;t appear in My Ads later.
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <a
              href={generatedAd.image_url}
              download="launchory-ad-creative.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              <Download size={14} />
              Download Ad
            </a>
            <button
              onClick={handleGenerateAnother}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors border border-gray-700"
            >
              <RotateCw size={14} />
              Generate Another
            </button>
          </div>
        </div>
      ) : generating ? (
        <div className="flex flex-col items-center justify-center gap-4 py-14 px-4 text-center">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Crafting your ad creative…</p>
            <p className="text-gray-500 text-xs mt-1">This usually takes 10–30 seconds.</p>
          </div>
          {stillWorking && (
            <p className="text-indigo-400 text-xs bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3 py-1.5">
              Still working, image generation can take up to 30 seconds…
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2 block">Choose an ad angle</span>
            <div className="space-y-2">
              {adAngles.map((angle, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAngle(angle)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                    selectedAngle === angle
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {angle}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2 block">Ad format</span>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    format === f.value ? 'bg-indigo-600/15 border-indigo-500' : 'bg-gray-800/60 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="text-white text-xs font-semibold">{f.label}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{f.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2 block">Style</span>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`p-3 rounded-xl border text-center text-xs font-medium transition-colors ${
                    style === s.value ? 'bg-indigo-600/15 border-indigo-500 text-white' : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedAngle}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={15} />
            Generate Ad
          </button>
        </div>
      )}
    </div>
  )
}
