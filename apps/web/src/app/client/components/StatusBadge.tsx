import type { OrderStatus } from '@agency/types'
import { STATUS_COLORS } from '@/constants/statusColors'

interface StatusBadgeProps {
  status: OrderStatus
}

const statusLabels: Record<OrderStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  proposal_sent: 'Proposal Sent',
  contract_signed: 'Contract Signed',
  in_development: 'In Development',
  done: 'Done',
  rejected: 'Rejected',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider ${STATUS_COLORS[status].border} ${STATUS_COLORS[status].text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status].dot} animate-pulse`} />
      {statusLabels[status]}
    </span>
  )
}
