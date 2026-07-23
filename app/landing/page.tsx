import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Rocket, ArrowRight, TrendingUp, Zap, Target, Megaphone,
  DollarSign, Search, Flame, Bookmark, Package, Star,
} from 'lucide-react'
import { PricingSection } from '@/app/components/PricingSection'
import { ReferralCapture } from '@/app/components/ReferralCapture'
import { DemoSection } from '@/app/components/DemoSection'

export const metadata: Metadata = {
  title: 'Find Winning Products Faster',
  description: 'AI-powered product research for Shopify dropshippers. Discover trends, analyze competition, and generate ad angles in seconds.',
}

const stats = [
  { value: '15+', label: 'Products Daily' },
  { value: '3 sec', label: 'Analysis Time' },
  { value: 'Free', label: 'To Start' },
  { value: '$29', label: 'Pro Plan' },
]

const features = [
  { icon: Search, title: 'Winning Product Feed', description: 'A curated, daily feed of trending Shopify products so you never miss the next winner.' },
  { icon: Zap, title: 'AI Product Analyzer', description: 'Get instant demand scores and competition analysis powered by GPT-4o-mini.' },
  { icon: Target, title: 'Ad Angle Generator', description: 'AI-generated ad angles tailored to each product, ready to plug into your campaigns.' },
  { icon: Megaphone, title: 'Video Hook Ideas', description: 'Scroll-stopping hook ideas for your UGC and short-form video ads.' },
  { icon: TrendingUp, title: 'Competition Analysis', description: 'Know how saturated a niche is before you spend a dollar on ads.' },
  { icon: DollarSign, title: 'Pricing Suggestions', description: 'AI-recommended price ranges based on margin and market data.' },
]

const testimonials = [
  {
    initials: 'JM',
    name: 'Jake M.',
    role: 'Shopify store owner',
    quote: 'Found a winning product in my first week and it did $8k in sales the first month. The AI analysis alone saved me hours of manual research per product.',
    color: 'bg-indigo-600',
  },
  {
    initials: 'ST',
    name: 'Sarah T.',
    role: '7-figure dropshipper',
    quote: 'I was skeptical about another "winning products" tool, but the ad angle suggestions are genuinely useful — I\'ve used three of them almost word-for-word in live campaigns.',
    color: 'bg-emerald-600',
  },
  {
    initials: 'DK',
    name: 'David K.',
    role: 'Started dropshipping 6 months ago',
    quote: 'As a beginner, the demand scores and competition breakdown took the guesswork out of picking products. I finally stopped wasting ad spend testing duds.',
    color: 'bg-orange-600',
  },
]

const asSeenOn = ['YouTube', 'TikTok', 'Shopify', 'AliExpress']

const steps = [
  { number: '1', title: 'Find a product', description: 'Browse today’s curated feed of trending Shopify products.' },
  { number: '2', title: 'Click AI Analyze', description: 'Run a one-click AI analysis on any product that catches your eye.' },
  { number: '3', title: 'Get instant insights', description: 'Demand score, competition level, pricing, ad angles, and hooks — instantly.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <ReferralCapture />
      <nav className="fixed top-0 inset-x-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Launchory</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-3 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Start for Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-40 pb-24">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:32px_32px]"
        />
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-indigo-600/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-6">
            <Zap size={12} />
            Now in Beta — Free to try
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6 max-w-3xl mx-auto">
            Find Winning Products Before Your Competitors
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered product research for Shopify dropshippers. Discover trends, analyze competition, and generate ad angles in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              Start for Free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-gray-900 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors border border-gray-700 hover:border-gray-500"
            >
              See How It Works
            </a>
          </div>

          {/* Product preview mockup */}
          <div className="relative max-w-sm mx-auto">
            <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-2xl" aria-hidden />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 text-left">
              <div className="relative h-40 bg-gradient-to-br from-indigo-600/30 via-gray-800 to-gray-900 flex items-center justify-center">
                <Package size={36} className="text-indigo-400/50" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-400 border-red-500/30">
                    <Flame size={12} />
                    Hot
                  </span>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
                  <Bookmark size={14} className="text-gray-400" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Kitchen Gadgets</span>
                    <h3 className="text-white font-semibold text-base mt-0.5 leading-snug">Electric Mini Vegetable Chopper</h3>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div
                      className="relative w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'conic-gradient(#ef4444 338deg, #1f2937 0deg)' }}
                    >
                      <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">94</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500">demand</span>
                  </div>
                </div>
                <div className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2">
                  <Zap size={14} />
                  AI Analyze
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DemoSection />

      {/* Stats bar */}
      <section className="border-y border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-y-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center px-8 ${i > 0 ? 'sm:border-l sm:border-gray-800' : ''}`}
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to find winners</h2>
          <p className="text-gray-400">One platform, from discovery to launch.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors">
              <div className="w-11 h-11 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Trusted by dropshippers worldwide</h2>
          <p className="text-gray-400">Real results from real stores.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-xs uppercase tracking-wider font-medium mb-5">As seen on</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {asSeenOn.map((brand) => (
              <span key={brand} className="text-gray-600 text-xl font-bold tracking-tight">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
          <p className="text-gray-400">From idea to insight in three steps.</p>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div
            aria-hidden
            className="hidden md:block absolute top-6 left-[16.6%] right-[16.6%] border-t border-dashed border-gray-800"
          />
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="relative z-10 w-12 h-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                {step.number}
              </div>
              <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <PricingSection />

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-indigo-900/40 border border-indigo-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your next winning product?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join dropshippers using Launchory to research smarter, not harder.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
          >
            Start for Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-gray-500 text-sm">Launchory &copy; 2025</span>
          <div className="flex items-center gap-6">
            <Link href="/changelog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Changelog</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
