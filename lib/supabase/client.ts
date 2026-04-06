import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        sameSite: 'lax',
        secure: true,
        path: '/',
      },
      auth: {
        // Disable the IndexedDB-based lock. The lock is designed to
        // prevent concurrent token refreshes across tabs, but on a
        // stable production origin it can hang indefinitely if a
        // previous call left it acquired (stale tab, failed init, etc.).
        // Preview deployments get fresh subdomains so they never hit
        // the stale lock — which is why auth works there but not on
        // the production URL.
        lock: undefined,
        // Isolate storage from any stale tokens that may have been
        // written by older versions of the client.
        storageKey: 'habit-museum-auth',
        flowType: 'pkce',
      },
    }
  )
}
