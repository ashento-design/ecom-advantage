// Basic SSRF hardening for server-side fetches of user-supplied URLs.
// Not exhaustive (doesn't resolve DNS to catch hostnames that point at
// private IPs), but blocks the obvious local/internal targets before the
// server ever issues a request to them.

const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, // link-local / cloud metadata (e.g. 169.254.169.254)
  /^\[?::1\]?$/,
  /^\[?fe80:/i,
]

export function parseSafeStoreUrl(input: string): URL | null {
  let url: URL
  try {
    url = new URL(input.includes('://') ? input : `https://${input}`)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(url.hostname))) return null

  return url
}
