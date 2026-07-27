import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

async function getProductForMetadata(id: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('products')
      .select('title, image_url, niche, demand_score, trend_label')
      .eq('id', id)
      .single()
    return data
  } catch {
    return null
  }
}

// Product pages are public (see page.tsx) — this builds real per-product
// Open Graph tags so shared links on Discord/Reddit/social show the actual
// product instead of a generic site preview, which is the whole point of
// making these pages shareable.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProductForMetadata(id)

  if (!product) {
    return {
      title: 'Product Details',
      description: 'AI-powered demand score, competition analysis, and ad angles for this product.',
    }
  }

  const ogTitle = `${product.title} — Launchory Product Research`
  const description = `Demand Score: ${product.demand_score}/100 | ${product.niche} | ${product.trend_label} trend. Analyze this winning dropshipping product on Launchory.`

  return {
    title: product.title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
