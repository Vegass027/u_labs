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

      const { data: { session: check } } = await supabase.auth.getSession()
      console.log('[callback] getSession after setSession:', check?.user?.email)

      console.log('[callback] cookies:', document.cookie)

      if (error || !session?.user) {
        window.location.href = '/login'
        return
      }

      if (!session.user.app_metadata?.role && session.user.user_metadata?.role) {
        const role = session.user.user_metadata.role
        const fullName = session.user.user_metadata.full_name || session.user.email?.split('@')[0] || ''

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/confirm-invite`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role, fullName })
        })

        const { data: { session: refreshed } } = await supabase.auth.refreshSession()
        
        const finalRole = refreshed?.user.app_metadata?.role || role
        const map: Record<string, string> = { owner: '/dashboard', manager: '/manager', client: '/client' }
        window.location.href = map[finalRole] ?? '/client'
        return
      }

      const role = session.user.app_metadata?.role || session.user.user_metadata?.role
      const map: Record<string, string> = {
        owner:   '/dashboard',
        manager: '/manager',
        client:  '/client',
      }

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
