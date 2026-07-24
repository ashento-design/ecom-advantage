import product10 from './10-winning-dropshipping-products-to-test-this-month.json'
import findEarly from './how-to-find-winning-products-before-they-go-viral.json'
import completeGuide from './complete-guide-to-dropshipping-product-research-2026.json'

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  content: BlogBlock[]
}

export const posts: BlogPost[] = [product10, findEarly, completeGuide]
  .map((post) => post as BlogPost)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}
