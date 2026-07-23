import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Rocket, ArrowLeft, Sparkles, Puzzle, TrendingUp, Zap, Video,
  Eye, ShoppingCart, Smartphone, Users, Lock,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog',
  description: "See what's new in Launchory and what's coming next.",
}

const releases = [
  {
    version: '0.8',
    date: 'July 2025',
    current: true,
    items: [
      'AI Ad Creative Generator — generate scroll-stopping ad images from any product',
      'My Ads Gallery — view and download all your generated ad creatives',
      'Supplier Quick Links — find products on AliExpress, CJDropshipping, and Zendrop instantly',
      'Enriched AI Analysis — now includes target audience, best platforms, seasonality, and wow factor',
      'Referral System — earn rewards by referring other dropshippers',
    ],
  },
  {
    version: '0.7',
    date: 'July 2025',
    items: [
      'Product Detail Pages — deep dive into any product with full analysis',
      'Search — find any product instantly across the entire database',
      'Saved Products — bookmark products to your personal board',
      'Dashboard Tabs — Hot This Week, New Arrivals, Staff Picks',
      'Admin Panel — manage products and view platform analytics',
    ],
  },
  {
    version: '0.6',
    date: 'June 2025',
    items: [
      'Stripe Payments — Pro plan at $29/month',
      'Paywall — 3 free AI analyses then upgrade to Pro',
      'Account Page — manage your plan and usage',
      'Mobile Responsive — full mobile support',
    ],
  },
  {
    version: '0.5',
    date: 'June 2025',
    items: [
      'AI Product Analyzer — instant demand scores, competition analysis, ad angles, and hooks',
      'User Authentication — sign up, log in, secure accounts',
      'Product Feed — curated daily winning products across 12 niches',
    ],
  },
]

const comingSoon = [
  { icon: Puzzle, title: 'Chrome Extension', description: 'Analyze any product while browsing AliExpress.' },
  { icon: TrendingUp, title: 'TikTok Trend Integration', description: 'Spot viral products before they peak.' },
  { icon: Zap, title: 'Automated Product Discovery', description: 'AI finds new winners daily.' },
  { icon: Video, title: 'Video Ad Generator', description: 'Create video ads, not just images.' },
  { icon: Eye, title: 'Competitor Store Tracker', description: 'Spy on successful Shopify stores.' },
  { icon: ShoppingCart, title: 'One-Click Product Import', description: 'Import to your Shopify store instantly.' },
  { icon: Smartphone, title: 'Mobile App', description: 'Launchory on iOS and Android.' },
  { icon: Users, title: 'Affiliate Program', description: 'Earn 30% recurring commission.' },
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Launchory</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to app
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Changelog</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">What&apos;s new in Launchory</h1>
          <p className="text-gray-400">A running history of everything we&apos;ve shipped — and what&apos;s coming next.</p>
        </div>

        {/* Release timeline */}
        <div className="relative pl-8 mb-20">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gray-800" />
          <div className="space-y-12">
            {releases.map((release) => (
              <div key={release.version} className="relative">
                <div
                  className={`absolute -left-8 top-1 w-5 h-5 rounded-full border-4 border-gray-950 ${
                    release.current ? 'bg-indigo-500' : 'bg-gray-700'
                  }`}
                />
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <h2 className="text-white font-bold text-xl">v{release.version}</h2>
                  <span className="text-gray-500 text-sm">{release.date}</span>
                  {release.current && (
                    <span className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                      Current Beta
                    </span>
                  )}
                </div>
                <ul className="space-y-3">
                  {release.items.map((item) => {
                    const [title, ...rest] = item.split(' — ')
                    const description = rest.join(' — ')
                    return (
                      <li key={item} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-white font-medium text-sm">{title}</p>
                        {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} className="text-gray-500" />
            <h2 className="text-white font-bold text-lg">Coming soon</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comingSoon.map((feature) => (
              <div
                key={feature.title}
                className="relative bg-gray-900/60 border border-gray-800 rounded-xl p-4 overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                    <feature.icon size={16} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-300 font-medium text-sm">{feature.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{feature.description}</p>
                  </div>
                  <Lock size={12} className="text-gray-600 shrink-0 ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
