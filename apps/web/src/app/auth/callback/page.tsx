'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1))
      const type = params.get('type')
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (type === 'recovery' && accessToken && refreshToken) {
        const supabase = createClient()

        try {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          router.replace('/auth/reset-password')
          return
        } catch (error) {
          router.replace('/login')
          return
        }
      }

      // Для других типов перенаправляем на серверный route handler
      // Убираем hash и перезагружаем страницу без hash
      window.location.href = window.location.pathname + window.location.search
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-sm font-mono text-muted-foreground">
        <span className="text-terminal-comment">//</span> Обработка авторизации...
      </div>
    </div>
  )
}
