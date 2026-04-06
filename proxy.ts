import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/today', '/review', '/dashboard', '/edit', '/onboarding']
const AUTH_ONLY = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    const isProtected = PROTECTED.some(p => pathname.startsWith(p))
    const isAuthOnly  = AUTH_ONLY.some(p => pathname.startsWith(p))

    if (!isProtected && !isAuthOnly) return NextResponse.next()

    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return NextResponse.next()

    let response = NextResponse.next({ request })

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user && isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user && isAuthOnly) {
      return NextResponse.redirect(new URL('/today', request.url))
    }

    return response
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css)$).*)'],
}
