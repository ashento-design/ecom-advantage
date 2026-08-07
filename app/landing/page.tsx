import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Rocket, ArrowRight, TrendingUp, Zap, Image as ImageIcon, Video, BarChart3, Globe,
  FlaskConical, Search, Activity, Megaphone, Puzzle, Flame, Bookmark, Package,
} from 'lucide-react'
import { ReferralCapture } from '@/app/components/ReferralCapture'
import { TestimonialCard, type TestimonialData } from '@/app/components/TestimonialCard'
import { DemoSection } from '@/app/components/DemoSection'
import { PricingSection } from '@/app/components/PricingSection'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'

// Testimonials rarely change, so a short revalidation window keeps the
// landing page mostly static (fast, cacheable) while still picking up
// admin edits within a few minutes instead of requiring a full rebuild.
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Find Winning Products Faster',
  description: 'AI-powered product research for Shopify dropshippers. Discover trends, analyze competition, and generate ad angles in seconds.',
}

const stats = [
  { value: '250+', label: 'Winning Products' },
  { value: 'AI-Powered', label: 'Product Analysis' },
  { value: '10 Sec', label: 'To Find a Winner' },
  { value: '1-Click', label: 'Ad Creative Generation' },
]

const features = [
  { icon: TrendingUp, title: 'Winning Product Feed', description: 'Daily curated feed of trending Shopify products across 12 niches. Never run out of winning ideas.' },
  { icon: Zap, title: 'AI Product Analyzer', description: 'Instant demand scores, competition analysis, pricing suggestions, and market saturation — in seconds.' },
  { icon: ImageIcon, title: 'Ad Creative Generator', description: 'Generate scroll-stopping image ads using AI. Pick your angle, format, and style — ready to run.' },
  { icon: Video, title: 'Video Ad Scripts', description: 'Get full scene-by-scene video scripts with voiceover copy and music suggestions for TikTok and Reels.' },
  { icon: BarChart3, title: 'Store Intelligence', description: "Analyze any Shopify store's estimated revenue, top products, and winning strategies instantly." },
  { icon: Globe, title: 'Chrome Extension', description: 'Analyze any AliExpress product without leaving the page. One click to get full AI insights.' },
  { icon: FlaskConical, title: 'Testing Board', description: "Track which products you're testing, log your results, and calculate profit margins in one place." },
  { icon: Search, title: 'Supplier Finder', description: 'Find your product on AliExpress, CJDropshipping, and Zendrop instantly with one click.' },
  { icon: Activity, title: 'Market Saturation Meter', description: 'See how many stores are selling a product before you test it. Find low-competition winners faster.' },
]

async function getFeaturedTestimonials(): Promise<TestimonialData[]> {
  try {
    const supabaseAdmin = getServiceRoleClient()
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('name, role, company, content, rating, avatar_initials')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(3)
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error('[landing] Failed to fetch testimonials:', err)
    return []
  }
}

const steps = [
  { number: '1', icon: Search, title: "Browse Today's Winners", description: 'Open Launchory and browse 250+ curated winning products updated daily across 12 niches.' },
  { number: '2', icon: Zap, title: 'Analyze with AI', description: 'Click AI Analyze on any product. Get demand scores, ad angles, hooks, competition data, and pricing — in under 10 seconds.' },
  { number: '3', icon: Megaphone, title: 'Launch Your Campaign', description: 'Generate image ads or video scripts, find your supplier, and launch with confidence.' },
]

export default async function LandingPage() {
  const testimonials = await getFeaturedTestimonials()

  return (
    <div className="min-h-screen bg-gray-950">
      <ReferralCapture />
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
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
                className="px-4 py-2 border border-indigo-500 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-sm font-medium rounded-xl transition-colors"
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
          <div className="flex items-center justify-center mb-6">
            <Link
              href="/extension"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-xs font-medium transition-colors"
            >
              <Puzzle size={12} />
              Chrome Extension Available
            </Link>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6 max-w-3xl mx-auto">
            Find Winning Products. Build Better Ads. Scale Faster.
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Launchory is the AI-powered research platform built for Shopify dropshippers. Find winning products, analyze competition, and generate ad creatives — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-full transition-colors"
            >
              Start for Free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-full transition-colors border border-gray-700 hover:border-gray-500"
            >
              See How It Works
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-gray-500 text-sm mb-16">
            <span>✓ No credit card required</span>
            <span>✓ 3 free AI analyses</span>
            <span>✓ Cancel anytime</span>
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

      <DemoSection />

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to find winners</h2>
          <p className="text-gray-400">One platform, from discovery to launch.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="h-full flex flex-col bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-4 shrink-0">
                <feature.icon size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      {testimonials.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Loved by dropshippers worldwide</h2>
            <p className="text-gray-400">Real results from real stores.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={`${t.name}-${t.avatar_initials}`} testimonial={t} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
          <p className="text-gray-400">From idea to insight in three steps.</p>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div
            aria-hidden
            className="hidden md:block absolute top-7 left-[16.6%] right-[16.6%] border-t border-dashed border-gray-700"
          />
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="relative z-10 w-14 h-14 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 ring-4 ring-gray-950">
                {step.number}
              </div>
              <step.icon size={16} className="mx-auto text-indigo-400 mb-3" />
              <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <PricingSection />

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-indigo-950 via-indigo-950 to-gray-950 border border-indigo-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your next winning product?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join thousands of dropshippers using Launchory to research smarter, not harder.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-full transition-colors"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <p className="text-gray-500 text-sm mt-5">Free to start &bull; No credit card required &bull; Cancel anytime</p>
          <p className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-medium mt-4">
            <Flame size={12} />
            New products added daily
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-gray-500 text-sm">Launchory &copy; 2026</span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms</Link>
            <Link href="/help" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Help</Link>
            <Link href="/blog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Blog</Link>
            <Link href="/changelog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Changelog</Link>
            <Link href="/extension" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Chrome Extension</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
