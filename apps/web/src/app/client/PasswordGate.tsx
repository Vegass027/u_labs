'use client'

import { useRouter } from 'next/navigation'
import { SetPasswordModal } from '@/components/SetPasswordModal'

export function PasswordGate() {
  const router = useRouter()
  return <SetPasswordModal onSuccess={() => router.refresh()} />
}
