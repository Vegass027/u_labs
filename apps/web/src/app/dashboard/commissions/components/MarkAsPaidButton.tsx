'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface MarkAsPaidButtonProps {
  commissionId: string
}

export function MarkAsPaidButton({ commissionId }: MarkAsPaidButtonProps) {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleMarkAsPaid = async () => {
    try {
      setIsLoading(true)
      await api.patch(`/api/admin/commissions/${commissionId}/pay`, {})
      setIsPaid(true)
      router.refresh()
    } catch (error) {
      console.error('Error marking commission as paid:', error)
      alert('Ошибка при отметке комиссии как оплаченной')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkAsPaid}
      disabled={isPaid || isLoading}
      className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${
        isPaid || isLoading
          ? 'bg-card border border-border text-muted-foreground cursor-not-allowed'
          : 'bg-primary text-primary-foreground hover:text-glow-sm hover:border-primary/40'
      }`}
    >
      {isLoading ? '// загрузка...' : isPaid ? '// оплачено' : 'pay()'}
    </button>
  )
}
