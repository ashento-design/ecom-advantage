import { ThumbsUp, Music2, TrendingUp } from 'lucide-react'
import { buildAdSearchLinks } from '@/app/lib/adSearchLinks'

export function AdSearchButtons({ title, className }: { title: string; className?: string }) {
  const links = buildAdSearchLinks(title)

  return (
    <div className={className ?? 'flex flex-wrap gap-2'}>
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-colors"
      >
        <ThumbsUp size={13} />
        Search Facebook Ads
      </a>
      <a
        href={links.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-semibold transition-colors"
      >
        <Music2 size={13} />
        Search TikTok Ads
      </a>
      <a
        href={links.google}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-semibold transition-colors"
      >
        <TrendingUp size={13} />
        Search Google Trends
      </a>
    </div>
  )
}
