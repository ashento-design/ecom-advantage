import { createBrowserClient } from '@/app/lib/supabase'

export type TestStatus = 'testing' | 'winner' | 'loser' | 'paused'

export type ProductTest = {
  id: string
  user_id: string
  product_id: string
  status: TestStatus
  store_url: string | null
  notes: string | null
  daily_spend: number | null
  revenue: number | null
  orders: number | null
  started_at: string
  updated_at: string
}

export const TEST_STATUS_OPTIONS: { value: TestStatus; label: string }[] = [
  { value: 'testing', label: 'Testing' },
  { value: 'winner', label: 'Winner' },
  { value: 'loser', label: 'Loser' },
  { value: 'paused', label: 'Paused' },
]

// Upsert on (user_id, product_id) — re-adding a product already on the
// board just updates its status/notes instead of erroring on the unique
// constraint, which matches what a user expects from "Add to Testing Board".
export async function addProductTest(userId: string, productId: string, status: TestStatus, notes: string) {
  const supabase = createBrowserClient()
  return supabase
    .from('product_tests')
    .upsert(
      { user_id: userId, product_id: productId, status, notes: notes || null, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,product_id' }
    )
}

export async function updateProductTestStatus(testId: string, status: TestStatus) {
  const supabase = createBrowserClient()
  return supabase.from('product_tests').update({ status, updated_at: new Date().toISOString() }).eq('id', testId)
}

export async function updateProductTestNotes(testId: string, notes: string) {
  const supabase = createBrowserClient()
  return supabase.from('product_tests').update({ notes: notes || null, updated_at: new Date().toISOString() }).eq('id', testId)
}

export async function updateProductTestMetrics(testId: string, fields: { store_url?: string; daily_spend?: number | null; revenue?: number | null; orders?: number | null }) {
  const supabase = createBrowserClient()
  return supabase.from('product_tests').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', testId)
}

export async function deleteProductTest(testId: string) {
  const supabase = createBrowserClient()
  return supabase.from('product_tests').delete().eq('id', testId)
}

export function daysSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)))
}
