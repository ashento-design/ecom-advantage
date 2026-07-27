import Link from 'next/link'
import type { Metadata } from 'next'
import { Rocket, SquarePlay, Zap, Megaphone, TrendingUp, Image as ImageIcon } from 'lucide-react'
import { WaitlistEmailForm } from '@/app/components/WaitlistEmailForm'

export const metadata: Metadata = {
  title: 'Welcome from YouTube',
  description: 'Launchory — AI-powered product research for Shopify dropshippers. Join the waitlist for founding member pricing.',
  // Source-specific landing page — reached via a direct link from a video
  // description, not meant to be discovered through organic search (and
  // would otherwise read as near-duplicate content of /waitlist).
  robots: { index: false, follow: true },
}

export default function YouTubeLandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <section className="relative overflow-hidden pt-20 pb-20">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:32px_32px]"
        />
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-indigo-600/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <Link href="/landing" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Launchory</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium mb-6">
            <SquarePlay size={13} />
            Hey, if you found this from YouTube — welcome!
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
            The Product Research Tool Built By a Dropshipper, For Dropshippers
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-3 leading-relaxed">
            Launchory is built by Alex, the person behind Ecom Advantage — made for the exact problem every dropshipper has: finding winning products faster.
          </p>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-10">
            AI product analysis, ad creative generation, and competitor store intelligence — all in one place.
          </p>

          <div className="max-w-lg mx-auto">
            <WaitlistEmailForm source="youtube" />
            <p className="text-gray-600 text-xs mt-4">
              Free to join. Founding member price locked at <span className="text-indigo-400 font-medium">$19/mo</span> when you upgrade — launching Fall 2026.
            </p>
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">What&rsquo;s inside Launchory</h2>
            <p className="text-gray-400">A quick look at the tools you&rsquo;ll get access to.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">AI Analyzer</span>
                <Zap size={14} className="text-indigo-400" />
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="relative w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'conic-gradient(#6366f1 313deg, #1f2937 0deg)' }}
                >
                  <div className="absolute inset-1.5 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">87</span>
                  </div>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Demand Score</p>
                  <p className="text-gray-500 text-xs mt-0.5">Competition: Medium</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Ad Generator</span>
                <Megaphone size={14} className="text-indigo-400" />
              </div>
              <div className="h-16 rounded-lg bg-gradient-to-br from-indigo-600/30 via-gray-800 to-gray-900 flex items-center justify-center mb-3">
                <ImageIcon size={20} className="text-indigo-400/60" />
              </div>
              <div className="w-full bg-indigo-600 text-white text-xs font-medium py-2 rounded-lg text-center">Generate Ad</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Store Intelligence</span>
                <TrendingUp size={14} className="text-indigo-400" />
              </div>
              <p className="text-white text-2xl font-bold">$48K<span className="text-gray-500 text-xs font-normal ml-1">/mo est.</span></p>
              <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden mt-3">
                <div className="h-full w-4/5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800">
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <span className="text-gray-500 text-sm">By Ecom Advantage</span>
          <div className="flex items-center gap-6">
            <Link href="/landing" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">launchory.io</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
