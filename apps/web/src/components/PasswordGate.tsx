'use client'

import { SetPasswordModal } from '@/components/SetPasswordModal'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PasswordGate() {
  const [needsPassword, setNeedsPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkPasswordStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const passwordSet = user?.user_metadata?.password_set === true

      if (!passwordSet) {
        setNeedsPassword(true)
      }
      
      setLoading(false)
    }

    checkPasswordStatus()
  }, [])

  if (loading) {
    return null
  }

  if (!needsPassword) {
    return null
  }

  return <SetPasswordModal onSuccess={() => {
    // PasswordGate только проверяет password_set, не делает редиректы
    // Редирект происходит в SetPasswordModal через onSuccess callback
  }} />
}
