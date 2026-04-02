'use client'

import { useState } from 'react'
import type { ManagerStatus } from '@agency/types'
import { api } from '@/lib/api'

interface ManagerStatusDropdownProps {
  orderId: string
  currentStatus: ManagerStatus | null | undefined
}

const managerStatusLabels: Record<ManagerStatus, string> = {
  brief_ready: 'Бриф готов',
  negotiation: 'Переговоры',
  contract: 'Договор',
  cancelled: 'Отклонён',
}

const managerStatusStyles: Record<ManagerStatus, string> = {
  brief_ready: 'border border-primary/50 text-primary',
  negotiation: 'border border-amber-500/50 text-amber-400',
  contract: 'border border-purple-500/50 text-purple-400',
  cancelled: 'border border-red-500/50 text-red-400',
}

const managerStatusArrowColors: Record<ManagerStatus, string> = {
  brief_ready: 'text-primary',
  negotiation: 'text-amber-400',
  contract: 'text-purple-400',
  cancelled: 'text-red-400',
}

const managerStatusDots: Record<ManagerStatus, string> = {
  brief_ready: 'bg-primary',
  negotiation: 'bg-amber-400',
  contract: 'bg-purple-400',
  cancelled: 'bg-red-400',
}

export function ManagerStatusDropdown({ orderId, currentStatus }: ManagerStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<ManagerStatus | null | undefined>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: ManagerStatus) => {
    if (newStatus === status || isUpdating) return

    setIsUpdating(true)

    try {
      const { error } = await api.patch(`/api/manager/orders/${orderId}/manager-status`, {
        manager_status: newStatus,
      })

      if (error) {
        console.error('Failed to update manager status:', error)
        return
      }

      setStatus(newStatus)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to update manager status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const displayStatus = status || 'brief_ready'

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`h-8 rounded flex items-center justify-center px-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${managerStatusStyles[displayStatus]}`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${managerStatusDots[displayStatus]}`} />
          <span className="text-[10px] font-mono uppercase tracking-wider">{managerStatusLabels[displayStatus]}</span>
        </div>
        <svg className={`w-4 h-4 ${managerStatusArrowColors[displayStatus]} transition-transform ${isOpen ? 'rotate-180' : ''} ml-1.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-card border border-border rounded shadow-lg overflow-hidden">
            {Object.entries(managerStatusLabels).map(([statusKey, label]) => (
              <button
                key={statusKey}
                onClick={() => handleStatusChange(statusKey as ManagerStatus)}
                disabled={isUpdating || status === statusKey}
                className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${managerStatusDots[statusKey as ManagerStatus]}`} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
