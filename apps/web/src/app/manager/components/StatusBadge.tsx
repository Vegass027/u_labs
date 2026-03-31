import type { OrderStatus } from '@agency/types'

interface StatusBadgeProps {
  status: OrderStatus
}

const statusStyles: Record<OrderStatus, string> = {
  new: 'border border-muted-foreground/30 text-muted-foreground',
  reviewing: 'border border-primary/30 text-primary',
  proposal_sent: 'border border-amber-500/30 text-amber-400',
  contract_signed: 'border border-purple-500/30 text-purple-400',
  in_development: 'border border-primary/50 text-primary bg-primary/5',
  done: 'border border-primary text-primary bg-primary/10',
  rejected: 'border border-red-500/30 text-red-400',
}

const statusDots: Record<OrderStatus, string> = {
  new: 'bg-muted-foreground',
  reviewing: 'bg-primary',
  proposal_sent: 'bg-amber-400',
  contract_signed: 'bg-purple-400',
  in_development: 'bg-primary animate-pulse',
  done: 'bg-primary',
  rejected: 'bg-red-400',
}

const statusLabels: Record<OrderStatus, string> = {
  new: 'новая',
  reviewing: 'на рассмотрении',
  proposal_sent: 'предложение',
  contract_signed: 'договор',
  in_development: 'в работе',
  done: 'выполнен',
  rejected: 'отклонён',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`} />
      {statusLabels[status]}
    </span>
  )
}
