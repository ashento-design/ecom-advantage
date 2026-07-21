import type { MetadataRoute } from 'next'

const BASE_URL = 'https://ecom-advantage.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/landing`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/auth/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/auth/signup`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
