'use client'

import { useRouter } from 'next/navigation'
import { SetPasswordModal } from '@/components/SetPasswordModal'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.replace('/login')
        return
      }
    }

    checkAuth()
  }, [router])

  const handleSuccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.app_metadata?.role
    const map: Record<string, string> = { owner: '/dashboard', manager: '/manager', client: '/client' }
    router.replace(map[role] ?? '/client')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <SetPasswordModal onSuccess={handleSuccess} />
    </div>
  )
}
