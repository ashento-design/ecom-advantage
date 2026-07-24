import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import type { RecentlyViewedProduct } from '@/app/lib/recentlyViewed'

export function RecentlyViewedRow({ products }: { products: RecentlyViewedProduct[] }) {
  if (products.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={15} className="text-gray-500" />
        <span className="text-white font-semibold text-sm">Recently Viewed</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="shrink-0 w-36 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl overflow-hidden transition-colors"
          >
            <div className="relative h-24 bg-gray-800">
              <Image src={p.image_url} alt={p.title} fill sizes="144px" className="object-cover" />
            </div>
            <div className="p-2.5">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider truncate">{p.niche}</p>
              <p className="text-white text-xs font-medium mt-0.5 leading-snug line-clamp-2">{p.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
