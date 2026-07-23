import type { Product } from '@/app/types'

const CACHE_TTL_MS = 5 * 60 * 1000

let cachedProducts: Product[] | null = null
let cachedAt = 0

export function getCachedProducts(): Product[] | null {
  if (!cachedProducts) return null
  if (Date.now() - cachedAt > CACHE_TTL_MS) return null
  return cachedProducts
}

export function setCachedProducts(products: Product[]) {
  cachedProducts = products
  cachedAt = Date.now()
}
