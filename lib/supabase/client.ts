import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // Required on HTTPS (all Vercel deployments). sameSite 'lax'
        // is the standard for auth cookies — allows top-level navigations.
        // Domain is intentionally omitted so the browser uses the current
        // hostname; hardcoding '.vercel.app' would be rejected by browsers
        // because it is on the Public Suffix List.
        sameSite: 'lax',
        secure: true,
        path: '/',
      },
    }
  )
}
