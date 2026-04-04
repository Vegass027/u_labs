import { NextResponse, type NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

const protectedPaths = ['/dashboard', '/manager', '/client', '/settings']
const authPaths = ['/login', '/register']
const publicPaths = ['/auth/callback', '/auth/reset-password']

function getUserFromCookies(req: NextRequest) {
  try {
    const allCookies = req.cookies.getAll()
    console.log('[MIDDLEWARE] Cookies:', allCookies.map(c => c.name))

    const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
    const cookieName = `sb-${projectId}-auth-token`

    let rawValue: string | undefined

    // Новый chunked формат
    const chunk0 = req.cookies.get(`${cookieName}.0`)
    if (chunk0) {
      const chunk1 = req.cookies.get(`${cookieName}.1`)
      rawValue = chunk0.value + (chunk1?.value || '')
    } else {
      // Старый единый формат
      rawValue = req.cookies.get(cookieName)?.value
    }

    if (!rawValue) return null

    let session: { access_token?: string } | null = null
    const val = decodeURIComponent(rawValue)

    if (val.startsWith('base64-')) {
      const json = Buffer.from(val.replace('base64-', ''), 'base64').toString('utf-8')
      session = JSON.parse(json)
    } else {
      session = JSON.parse(val)
    }

    if (!session?.access_token) return null

    const decoded = jwtDecode<{ sub: string; app_metadata?: { role?: string } }>(session.access_token)
    return decoded
  } catch (e) {
    console.log('[MIDDLEWARE] Cookie parse error:', e)
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPath = authPaths.some(p => pathname.startsWith(p))
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

  if (isPublicPath || (!isProtectedPath && !isAuthPath)) {
    return NextResponse.next()
  }

  const user = getUserFromCookies(req)
  const role = user?.app_metadata?.role

  console.log('[MIDDLEWARE] Path:', pathname, 'User:', user?.sub, 'Role:', role)

  if (!user && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user && isAuthPath) {
    const redirectUrl = role === 'owner' ? '/dashboard' : role === 'manager' ? '/manager' : '/client'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  if (user && isProtectedPath) {
    if (pathname.startsWith('/dashboard') && role !== 'owner')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    if (pathname.startsWith('/manager') && role !== 'manager')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    if (pathname.startsWith('/client') && role !== 'client')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
