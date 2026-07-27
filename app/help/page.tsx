'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Rocket, Search, ChevronDown, Mail } from 'lucide-react'

type HelpArticle = {
  category: string
  question: string
  answer: string
}

const CATEGORIES = ['Getting Started', 'AI Analyzer', 'Ad Generator', 'Store Intelligence', 'Billing & Plans', 'Account'] as const

const ARTICLES: HelpArticle[] = [
  {
    category: 'Getting Started',
    question: 'How do I find my first winning product?',
    answer: 'Browse today’s curated feed on your dashboard and look for products with a high demand score and a "Hot" or "Trending" label. Click "AI Analyze" on anything that catches your eye to get a full breakdown — demand, competition, suggested pricing, ad angles, and video hooks — in seconds.',
  },
  {
    category: 'Getting Started',
    question: 'How do the niche filters work?',
    answer: 'Use the niche tabs at the top of your dashboard feed to narrow products down to a specific category, like Fitness, Pet Supplies, or Home Decor. This makes it easier to build focused pattern-recognition in a niche instead of jumping between unrelated products every day.',
  },
  {
    category: 'Getting Started',
    question: 'What is the Launchory Score?',
    answer: 'The Launchory Score blends the AI demand score with real engagement on the platform — how many people are viewing and saving a product right now, plus a bonus for products labeled Hot or Trending. It’s a quick way to see what’s actually gaining traction today, not just what looks promising on paper.',
  },
  {
    category: 'AI Analyzer',
    question: 'How does the AI analyzer work?',
    answer: 'When you click "AI Analyze," Launchory sends the product’s title, description, and niche to an AI model that returns a demand score, competition level, suggested price range, ad angles, video hooks, target audience, and more — typically in about 3 seconds.',
  },
  {
    category: 'AI Analyzer',
    question: 'What do the demand scores mean?',
    answer: 'Demand scores run from 1–100. Higher scores mean the AI sees stronger buyer-interest signals in the product’s category and positioning. Treat it as a directional signal to prioritize what to test first, not a guarantee of sales.',
  },
  {
    category: 'AI Analyzer',
    question: 'How accurate are the competition estimates?',
    answer: 'Competition levels (Low/Medium/High) are the AI’s read based on the product description and category — they’re a useful starting signal, but we’d still recommend a quick manual check (searching the product name, checking ad libraries) before committing real budget.',
  },
  {
    category: 'Ad Generator',
    question: 'How do I generate my first ad?',
    answer: 'From a product’s AI analysis, scroll to "Generate Ad Creative," pick one of the suggested ad angles, choose a format (Square, Vertical, or Horizontal), and a style (Clean Product Shot, Lifestyle Scene, Bold Text Focus, or Minimalist), then click Generate Ad.',
  },
  {
    category: 'Ad Generator',
    question: 'What ad formats are available?',
    answer: 'Square (1:1) is styled for Instagram and Facebook feeds, Vertical (9:16) is styled for TikTok and Stories, and Horizontal (16:9) is styled like a YouTube thumbnail. Pick whichever matches where you’re actually planning to run the ad.',
  },
  {
    category: 'Ad Generator',
    question: 'How do I use reference images?',
    answer: 'Before generating, you can upload your actual product photo (or paste a direct image URL) in the "Upload your product photo" section. This is optional but recommended — it tells the AI to match your real product’s appearance instead of generating a generic-looking item.',
  },
  {
    category: 'Store Intelligence',
    question: 'How does revenue estimation work?',
    answer: 'Store Intelligence (a Pro feature) scrapes a store’s public product and collection data, classifies the store’s rough size tier, and uses AI — calibrated with known benchmarks and, where relevant, real-world brand knowledge — to estimate monthly revenue and traffic.',
  },
  {
    category: 'Store Intelligence',
    question: 'Why might estimates vary from reality?',
    answer: 'These are approximations based on public storefront data and AI analysis, not real sales figures — actual revenue can vary significantly, especially for stores with a lot of offline, wholesale, or other sales channels the public store doesn’t reflect.',
  },
  {
    category: 'Store Intelligence',
    question: 'What stores can I analyze?',
    answer: 'Any live, public Shopify store works best — Launchory reads the store’s public products.json and collections.json data. If a domain doesn’t expose those (i.e. it isn’t actually a Shopify store), you’ll see a message asking you to double check the domain.',
  },
  {
    category: 'Billing & Plans',
    question: 'How do I upgrade to Pro?',
    answer: 'Go to your Account page and click "Upgrade to Pro." You’ll be taken to a secure Stripe checkout page — once payment completes, your account is upgraded immediately.',
  },
  {
    category: 'Billing & Plans',
    question: 'How do I cancel my subscription?',
    answer: 'Email hello@launchory.io and we’ll cancel it for you right away — self-serve cancellation from the account page is on the way. You’ll keep Pro access through the end of your current billing period either way.',
  },
  {
    category: 'Billing & Plans',
    question: 'What is the founding member price?',
    answer: 'Dropshippers who join the waitlist before our Fall 2026 launch lock in Pro at $19/mo forever, instead of the $29/mo standard price. The first 200 waitlist subscribers get priority on founding member spots.',
  },
  {
    category: 'Billing & Plans',
    question: 'What is your refund policy?',
    answer: 'Pro comes with a 7-day money-back guarantee. If it’s not for you within your first week, email hello@launchory.io and we’ll refund you, no questions asked.',
  },
  {
    category: 'Account',
    question: 'How do I update my account details?',
    answer: 'Your name and email preferences (weekly digest, breakout alerts) can be managed from your Account page. For your email address or password, contact hello@launchory.io and we’ll help you update it.',
  },
  {
    category: 'Account',
    question: 'How do I change my email or password?',
    answer: 'Email hello@launchory.io with the change you need — we handle these manually today to keep your account secure while we build out self-serve credential management.',
  },
]

export default function HelpCenterPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ARTICLES.filter((a) => {
      const matchesCategory = activeCategory === 'All' || a.category === activeCategory
      const matchesQuery = !q || a.question.toLowerCase().includes(q) || a.answer.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, activeCategory])

  function toggleQuestion(question: string) {
    setOpenQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(question)) next.delete(question)
      else next.add(question)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <Link href="/landing" className="inline-flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Rocket size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">Launchory</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">Help Center</h1>
          <p className="text-gray-400">Answers to the most common questions about Launchory.</p>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles…"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No articles match &ldquo;{query}&rdquo;. Try a different search, or email us below.
          </div>
        ) : (
          <div className="space-y-2 mb-16">
            {filtered.map((article) => {
              const isOpen = openQuestions.has(article.question)
              return (
                <div key={article.question} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleQuestion(article.question)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">{article.category}</span>
                      <p className="text-white text-sm font-semibold mt-0.5">{article.question}</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 -mt-1">
                      <p className="text-gray-400 text-sm leading-relaxed">{article.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <Mail size={20} className="text-indigo-400 mx-auto mb-3" />
          <h2 className="text-white font-bold text-base mb-1.5">Still need help?</h2>
          <p className="text-gray-400 text-sm mb-4">Our team is quick to respond — just send us an email.</p>
          <a
            href="mailto:hello@launchory.io"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            hello@launchory.io
          </a>
        </div>
      </div>
    </div>
  )
}
