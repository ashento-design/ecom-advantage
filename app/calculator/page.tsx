import { redirect } from 'next/navigation'

// The profit calculator now lives inside the Testing Board as a tab.
// /calculator is kept as a redirect (forwarding any query params, e.g. the
// "Run the numbers" product/cost prefill) so existing bookmarks and shared
// links don't break.
export default async function CalculatorRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const qs = new URLSearchParams()
  qs.set('tab', 'calculator')
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') qs.set(key, value)
  }
  redirect(`/testing?${qs.toString()}`)
}
