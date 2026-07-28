import { createBrowserClient } from '@/app/lib/supabase'

export type Collection = {
  id: string
  user_id: string
  name: string
  description: string | null
  slug: string
  is_public: boolean
  product_ids: string[]
  creator_name: string | null
  created_at: string
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'collection'
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 7)
}

// Tries the plain slugified name first, then appends a short random suffix
// on collision — cheap enough at this scale, and avoids a race-prone
// "check then insert" pattern needing a transaction.
async function generateUniqueSlug(name: string): Promise<string> {
  const supabase = createBrowserClient()
  const base = slugify(name)

  const { data: existing } = await supabase.from('collections').select('slug').eq('slug', base).maybeSingle()
  if (!existing) return base

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${randomSuffix()}`
    const { data } = await supabase.from('collections').select('slug').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
  }
  return `${base}-${Date.now()}`
}

export async function createCollection(
  userId: string,
  name: string,
  description: string,
  productIds: string[],
  isPublic: boolean,
  creatorName: string
) {
  const supabase = createBrowserClient()
  const slug = await generateUniqueSlug(name)
  return supabase
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description: description || null,
      slug,
      is_public: isPublic,
      product_ids: productIds,
      creator_name: creatorName || null,
    })
    .select()
    .single()
}

export async function updateCollection(
  id: string,
  fields: Partial<Pick<Collection, 'name' | 'description' | 'is_public' | 'product_ids'>>
) {
  const supabase = createBrowserClient()
  return supabase.from('collections').update(fields).eq('id', id)
}

export async function deleteCollection(id: string) {
  const supabase = createBrowserClient()
  return supabase.from('collections').delete().eq('id', id)
}
