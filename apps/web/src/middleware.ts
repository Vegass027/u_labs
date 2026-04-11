import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const protectedPaths = ['/dashboard', '/manager', '/client', '/settings']
const authPaths = ['/login', '/register']
const publicPaths = ['/auth/callback', '/auth/reset-password', '/auth/confirm']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPath = authPaths.some(p => pathname.startsWith(p))
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

  if (isPublicPath || (!isProtectedPath && !isAuthPath)) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role

  if (!user && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user && isAuthPath) {
    const redirectUrl = role === 'owner' ? '/dashboard' : role === 'manager' ? '/manager' : '/client'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Не перенаправлять авторизованного пользователя с /auth/callback и /auth/reset-password
  // Пусть клиентский компонент сам решит куда перенаправить
  if (user && isPublicPath) {
    return NextResponse.next()
  }

  if (user && isProtectedPath) {
    if (pathname.startsWith('/dashboard') && role !== 'owner')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    if (pathname.startsWith('/manager') && role !== 'manager')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    if (pathname.startsWith('/client') && role !== 'client')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
