'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/app/actions/orders'
import type { OrderStatus } from '@agency/types'

interface UpdateStatusFormProps {
  orderId: string
  currentStatus: OrderStatus
}

const statusLabels: Record<OrderStatus, string> = {
  new: 'новая',
  reviewing: 'на рассмотрении',
  proposal_sent: 'предложение отправлено',
  contract_signed: 'договор подписан',
  in_development: 'в разработке',
  done: 'выполнено',
  rejected: 'отклонено',
}

const statusStyles: Record<OrderStatus, string> = {
  new: 'border border-blue-500/50 text-blue-400',
  reviewing: 'border border-amber-500/50 text-amber-400',
  proposal_sent: 'border border-purple-500/50 text-purple-400',
  contract_signed: 'border border-green-500/50 text-green-400',
  in_development: 'border border-cyan-500/50 text-cyan-400',
  done: 'border border-emerald-500/50 text-emerald-400',
  rejected: 'border border-red-500/50 text-red-400',
}

const statusArrowColors: Record<OrderStatus, string> = {
  new: 'text-blue-400',
  reviewing: 'text-amber-400',
  proposal_sent: 'text-purple-400',
  contract_signed: 'text-green-400',
  in_development: 'text-cyan-400',
  done: 'text-emerald-400',
  rejected: 'text-red-400',
}

const statusDots: Record<OrderStatus, string> = {
  new: 'bg-blue-400',
  reviewing: 'bg-amber-400',
  proposal_sent: 'bg-purple-400',
  contract_signed: 'bg-green-400',
  in_development: 'bg-cyan-400',
  done: 'bg-emerald-400',
  rejected: 'bg-red-400',
}

export function UpdateStatusForm({ orderId, currentStatus }: UpdateStatusFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === status || isUpdating) return

    setIsUpdating(true)
    setError('')

    const result = await updateOrderStatus(orderId, newStatus)

    if (result.error) {
      setError(result.error)
    } else {
      setStatus(newStatus)
      setIsOpen(false)
    }

    setIsUpdating(false)
  }

  return (
    <div className="flex-1">
      <h3 className="text-sm font-bold text-foreground font-mono mb-2">
        <span className="text-[#dcb67a]">//</span> обновить статус
      </h3>
      <div className="relative z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`h-10 w-full rounded flex items-center justify-between px-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm ${statusStyles[status]}`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`} />
            <span className="uppercase tracking-wider">{statusLabels[status]}</span>
          </div>
          <svg className={`w-4 h-4 ${statusArrowColors[status]} transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="absolute inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 w-full bg-card border border-border rounded shadow-lg overflow-hidden">
              {Object.entries(statusLabels).map(([statusKey, label]) => (
                <button
                  key={statusKey}
                  onClick={() => handleStatusChange(statusKey as OrderStatus)}
                  disabled={isUpdating || status === statusKey}
                  className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDots[statusKey as OrderStatus]}`} />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {error && (
        <div className="mt-2 text-sm font-mono text-red-400 px-3 py-2 rounded bg-red-500/10 border border-red-500/20">
          <span className="font-bold">[error]</span> {error}
        </div>
      )}
    </div>
  )
}
