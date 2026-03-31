import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPaths = ['/dashboard', '/manager', '/client', '/settings']

// Пути куда залогиненный пользователь не должен попадать
const authPaths = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPath = authPaths.some(p => pathname.startsWith(p))

  // Не защищённый и не auth путь — пропускаем без запросов
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next()
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Не залогинен + защищённый путь → на логин
  if (!user && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Залогинен + auth путь (login/register) → в кабинет
  if (user && isAuthPath) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    if (role === 'owner')   return NextResponse.redirect(new URL('/dashboard', req.url))
    if (role === 'manager') return NextResponse.redirect(new URL('/manager', req.url))
    if (role === 'client')  return NextResponse.redirect(new URL('/client', req.url))
  }

  // Залогинен + защищённый путь → проверяем роль
  if (user && isProtectedPath) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (!role) return NextResponse.redirect(new URL('/login', req.url))

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
