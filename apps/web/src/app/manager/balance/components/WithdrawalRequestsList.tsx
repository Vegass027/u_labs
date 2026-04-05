'use client'

import { Trash2 } from 'lucide-react'
import { cancelWithdrawalRequest } from '../../../actions/withdrawals'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WithdrawalRequestsListProps {
  withdrawals: any[]
}

export function WithdrawalRequestsList({ withdrawals }: WithdrawalRequestsListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const router = useRouter()

  async function handleCancel(withdrawalId: string) {
    setCancellingId(withdrawalId)
    try {
      await cancelWithdrawalRequest(withdrawalId)
      setShowConfirm(null)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось отменить заявку')
    } finally {
      setCancellingId(null)
    }
  }

  if (withdrawals.length === 0) {
    return null
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="px-4 py-3 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
        последние запросы на вывод
      </div>
      <div className="divide-y divide-border">
        {withdrawals.slice(0, 5).map((withdrawal: any) => (
          <div
            key={withdrawal.id}
            className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-muted-foreground shrink-0">
                {new Date(withdrawal.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
              </span>
              <span className="text-muted-foreground shrink-0">|</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                withdrawal.status === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : withdrawal.status === 'approved'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {withdrawal.status === 'pending'
                  ? 'в ожидании'
                  : withdrawal.status === 'approved'
                  ? 'одобрено'
                  : 'отклонено'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {withdrawal.status === 'pending' && (
                <>
                  {showConfirm === withdrawal.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">вы уверены?</span>
                      <button
                        type="button"
                        onClick={() => handleCancel(withdrawal.id)}
                        disabled={cancellingId === withdrawal.id}
                        className="text-[10px] text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        да
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirm(null)}
                        disabled={cancellingId === withdrawal.id}
                        className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        нет
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(withdrawal.id)}
                      disabled={cancellingId !== null}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Отменить заявку"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <span className="text-muted-foreground shrink-0">|</span>
                </>
              )}
              <span className="text-primary font-mono font-medium">
                {withdrawal.amount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
