import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Collect cookies to set — we'll apply them to the final redirect response
    // once we know whether to send the user to /today or /onboarding.
    const cookiesToApply: { name: string; value: string; options: Record<string, unknown> }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(c => cookiesToApply.push(c))
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if this is a new user (no habits yet) to decide where to land
      let destination = '/today'
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { count } = await supabase
            .from('habits')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
          if (count === 0) destination = '/onboarding'
        }
      } catch {
        // If the check fails for any reason, default to /today
      }

      const response = NextResponse.redirect(new URL(destination, requestUrl.origin))
      cookiesToApply.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      )
      return response
    }
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
