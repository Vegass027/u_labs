'use client'

import Link from 'next/link'
import type { CommissionTransaction, User, Order } from '@agency/types'
import { MarkAsPaidButton } from './MarkAsPaidButton'

interface CommissionWithRelations extends CommissionTransaction {
  manager?: Pick<User, 'full_name'> | null
  order?: Pick<Order, 'title'> | null
}

interface CommissionsClientProps {
  commissions: CommissionWithRelations[]
  searchParams: { status?: string }
}

export function CommissionsClient({ commissions, searchParams }: CommissionsClientProps) {
  const getTxStatusColor = (status: string | null | undefined): string => {
    const colors: Record<string, string> = {
      'reserved': 'text-amber-400',
      'payable': 'text-purple-400',
      'paid': 'text-green-400',
    }
    return status ? colors[status] || 'text-gray-400' : 'text-gray-400'
  }

  const getTxStatusText = (status: string | null | undefined): string => {
    const texts: Record<string, string> = {
      'reserved': 'Зарезервировано',
      'payable': 'К выплате',
      'paid': 'Оплачено',
    }
    return status ? texts[status] || '—' : '—'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* // ============================================================
          // HEADER SECTION
          // ============================================================ */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg text-foreground font-mono">
          <span className="font-bold">// Комиссии // -&gt;</span> <span className="text-[#dcb67a]">Все комиссии менеджеров:</span>
        </div>
      </div>

      {/* // ============================================================
          // FILTER BUTTONS
          // ============================================================ */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-mono text-terminal-comment mr-2">// фильтр по статусу:</span>
        <Link
          href="/dashboard/commissions"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${!searchParams.status ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #all
        </Link>
        <Link
          href="/dashboard/commissions?status=reserved"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'reserved' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #reserved
        </Link>
        <Link
          href="/dashboard/commissions?status=payable"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'payable' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #payable
        </Link>
        <Link
          href="/dashboard/commissions?status=paid"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'paid' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #paid
        </Link>
      </div>

      {/* // ============================================================
          // COMMISSIONS LIST - CODE STYLE WITH FIXED COLUMNS
          // ============================================================ */}
      <div className="font-mono text-sm">
        {commissions.length === 0 ? (
          <div className="text-muted-foreground text-xs">
            <div className="text-terminal-comment mb-2">// комиссий пока нет</div>
            <div>// ожидайте появления новых комиссий</div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="flex items-center hover:bg-muted/50 transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(74,222,128,0.3),0_-4px_20px_-4px_rgba(74,222,128,0.3)] rounded px-3 py-4 group"
              >
                {/* Code content with fixed columns */}
                <div className="flex-1 flex items-center gap-4">
                  {/* Arrow indicator */}
                  <span className="text-[#dcb67a] text-xs shrink-0">
                    &gt;&gt;&gt;
                  </span>

                  {/* Order title - fixed width */}
                  <span className="text-primary font-medium w-64 shrink-0 truncate">
                    {commission.order?.title || 'Unknown'}
                  </span>

                  {/* Manager - fixed width */}
                  <span className="text-muted-foreground w-48 shrink-0 truncate">
                    {'{' + (commission.manager?.full_name || 'Unknown') + '}'}
                  </span>

                  {/* Amount - fixed width */}
                  <span className="text-primary/70 w-32 shrink-0">
                    {`// ${commission.amount.toLocaleString('ru-RU')} ₽`}
                  </span>

                  {/* Status - fixed width */}
                  <span className={`${getTxStatusColor(commission.tx_status)} w-32 shrink-0`}>
                    #{getTxStatusText(commission.tx_status)}
                  </span>

                  {/* Date - fixed width */}
                  <span className="text-muted-foreground/60 text-xs w-36 shrink-0">
                    {'[' + new Date(commission.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ']'}
                  </span>

                  {/* Action button */}
                  <div className="w-32 shrink-0">
                    {commission.tx_status === 'payable' && (
                      <MarkAsPaidButton commissionId={commission.id} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
