import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Rocket, ArrowLeft, Calendar, Clock } from 'lucide-react'
import { posts, getPostBySlug } from '@/content/blog'
import { formatDateOnly } from '@/app/lib/formatDate'

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

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
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to blog
          </Link>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 mb-4">
          {post.category}
        </span>
        <h1 className="text-3xl font-bold text-white mb-4 leading-snug">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-500 text-xs mb-10">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDateOnly(post.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} />
            {post.readTime}
          </span>
        </div>

        <div className="space-y-5">
          {post.content.map((block, i) =>
            block.type === 'h2' ? (
              <h2 key={i} className="text-white font-bold text-xl pt-3">{block.text}</h2>
            ) : (
              <p key={i} className="text-gray-300 text-base leading-relaxed">{block.text}</p>
            )
          )}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm mb-4">Ready to find your next winning product?</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start for Free
          </Link>
        </div>
      </article>
    </div>
  )
}
