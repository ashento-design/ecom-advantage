import Link from 'next/link'
import {
  Rocket, ArrowRight, TrendingUp, Zap, Target, Megaphone,
  BarChart3, DollarSign, Search, Check,
} from 'lucide-react'

const stats = [
  { label: '15+ Winning Products Daily' },
  { label: 'AI-Powered Analysis' },
  { label: '3 Free Analyses' },
  { label: '$29/mo Pro Plan' },
]

const features = [
  { icon: Search, title: 'Winning Product Feed', description: 'A curated, daily feed of trending Shopify products so you never miss the next winner.' },
  { icon: Zap, title: 'AI Product Analyzer', description: 'Get instant demand scores and competition analysis powered by GPT-4o-mini.' },
  { icon: Target, title: 'Ad Angle Generator', description: 'AI-generated ad angles tailored to each product, ready to plug into your campaigns.' },
  { icon: Megaphone, title: 'Video Hook Ideas', description: 'Scroll-stopping hook ideas for your UGC and short-form video ads.' },
  { icon: TrendingUp, title: 'Competition Analysis', description: 'Know how saturated a niche is before you spend a dollar on ads.' },
  { icon: DollarSign, title: 'Pricing Suggestions', description: 'AI-recommended price ranges based on margin and market data.' },
]

const steps = [
  { number: '1', title: 'Find a product', description: 'Browse today’s curated feed of trending Shopify products.' },
  { number: '2', title: 'Click AI Analyze', description: 'Run a one-click AI analysis on any product that catches your eye.' },
  { number: '3', title: 'Get instant insights', description: 'Demand score, competition level, pricing, ad angles, and hooks — instantly.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Launchory</span>
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-6">
          <Zap size={12} />
          AI-powered product research
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
          Find Winning Products Before Your Competitors
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered product research for Shopify dropshippers. Discover trends, analyze competition, and generate ad angles in seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
          >
            Start for Free
            <ArrowRight size={16} />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors border border-gray-800"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <span className="text-white text-sm font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to find winners</h2>
          <p className="text-gray-400">One platform, from discovery to launch.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors">
              <div className="w-11 h-11 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
          <p className="text-gray-400">From idea to insight in three steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                {step.number}
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h2>
          <p className="text-gray-400">Start free. Upgrade when you&apos;re ready to scale.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h3 className="text-white font-semibold text-lg mb-1">Free</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-gray-500 text-sm">/mo</span>
            </div>
            <div className="space-y-3 mb-8">
              {['3 AI analyses / month', 'Basic product feed'].map((perk) => (
                <div key={perk} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-gray-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{perk}</span>
                </div>
              ))}
            </div>
            <Link
              href="/auth/signup"
              className="block text-center w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors border border-gray-700"
            >
              Start for Free
            </Link>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-gray-900 border border-indigo-500/30 rounded-2xl p-8 relative">
            <span className="absolute -top-3 left-8 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
            <h3 className="text-white font-semibold text-lg mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-gray-500 text-sm">/mo</span>
            </div>
            <div className="space-y-3 mb-8">
              {['Unlimited AI analyses', 'Full product feed', 'Breakout alerts', 'Priority support'].map((perk) => (
                <div key={perk} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-indigo-600/30 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-indigo-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{perk}</span>
                </div>
              ))}
            </div>
            <Link
              href="/auth/signup"
              className="block text-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12">
          <BarChart3 size={32} className="text-indigo-400 mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your next winning product?</h2>
          <p className="text-gray-400 mb-8">Join dropshippers using Launchory to research smarter, not harder.</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-gray-500 text-sm">Launchory &copy; 2025</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
