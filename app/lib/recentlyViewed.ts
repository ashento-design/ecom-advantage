const KEY = 'launchory_recently_viewed'
const MAX = 5

export type RecentlyViewedProduct = {
  id: string
  title: string
  image_url: string
  niche: string
}

export function getRecentlyViewed(): RecentlyViewedProduct[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function recordRecentlyViewed(product: RecentlyViewedProduct) {
  if (typeof window === 'undefined') return
  const current = getRecentlyViewed().filter((p) => p.id !== product.id)
  const next = [product, ...current].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(next))
}
