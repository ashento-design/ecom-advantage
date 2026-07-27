import type { MetadataRoute } from 'next'
import { posts } from '@/content/blog'

const BASE_URL = 'https://launchory.io'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/landing`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/waitlist`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/auth/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/auth/signup`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      lastModified: post.date,
    })),
  ]
}
