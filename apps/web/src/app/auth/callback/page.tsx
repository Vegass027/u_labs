'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (!accessToken || !refreshToken) {
        window.location.href = '/login'
        return
      }

      const { data: { session }, error } = await supabase.auth.setSession({
        access_token:  accessToken,
        refresh_token: refreshToken,
      })

      console.log('[callback] session:', session?.user?.email)
      console.log('[callback] error:', error)

      // Проверяем что сессия реально записалась
      const { data: { session: check } } = await supabase.auth.getSession()
      console.log('[callback] getSession after setSession:', check?.user?.email)

      // Смотрим cookies
      console.log('[callback] cookies:', document.cookie)

      if (error || !session?.user) {
        window.location.href = '/login'
        return
      }

      const role = session.user.user_metadata?.role
      const map: Record<string, string> = {
        owner:   '/dashboard',
        manager: '/manager',
        client:  '/client',
      }

      // Полная перезагрузка — middleware получит cookies
      window.location.href = map[role] ?? '/client'
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono text-muted-foreground text-sm">// авторизация...</p>
    </div>
  )
}
