import { createBrowserClient as _createBrowserClient, createServerClient as _createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createBrowserClient() {
  return _createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export async function createServerClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet, _headers) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component — cookie writes are ignored
        }
      },
    },
  })
}
