import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

async function getCollectionForMetadata(slug: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: collection } = await supabase
      .from('collections')
      .select('name, description, creator_name, product_ids')
      .eq('slug', slug)
      .eq('is_public', true)
      .single()

    if (!collection) return null

    let imageUrl: string | null = null
    if (collection.product_ids?.length > 0) {
      const { data: product } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', collection.product_ids[0])
        .maybeSingle()
      imageUrl = product?.image_url ?? null
    }

    return { ...collection, imageUrl }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionForMetadata(slug)

  if (!collection) {
    return {
      title: 'Product Collection',
      description: 'A curated product collection on Launchory.',
    }
  }

  const ownerLabel = collection.creator_name ? `${collection.creator_name}'s` : 'A'
  const title = `Check out ${ownerLabel} winning product collection on Launchory`
  const description = collection.description || `${collection.product_ids?.length ?? 0} winning products curated with Launchory.`

  return {
    title: collection.name,
    description,
    openGraph: {
      title,
      description,
      images: collection.imageUrl ? [{ url: collection.imageUrl }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: collection.imageUrl ? [collection.imageUrl] : undefined,
    },
  }
}

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
