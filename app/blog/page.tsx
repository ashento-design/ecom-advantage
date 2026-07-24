import Link from 'next/link'
import type { Metadata } from 'next'
import { Rocket, ArrowLeft, Calendar, Clock } from 'lucide-react'
import { posts } from '@/content/blog'
import { formatDateOnly } from '@/app/lib/formatDate'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Product research strategy, winning product ideas, and dropshipping guides from Launchory.',
}

export default function BlogIndexPage() {
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
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-white mb-3">The Launchory Blog</h1>
          <p className="text-gray-400">Product research strategy, winning product ideas, and dropshipping guides.</p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-6 transition-colors"
            >
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 mb-3">
                {post.category}
              </span>
              <h2 className="text-white font-bold text-xl mb-2 leading-snug">{post.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-gray-500 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={12} />
                  {formatDateOnly(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={12} />
                  {post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
