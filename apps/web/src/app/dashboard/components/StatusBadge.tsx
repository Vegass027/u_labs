import type { OrderStatus } from '@agency/types'

interface StatusBadgeProps {
  status: OrderStatus
}

const statusColors: Record<OrderStatus, string> = {
  new: 'bg-gray-100 text-gray-800',
  reviewing: 'bg-blue-100 text-blue-800',
  proposal_sent: 'bg-amber-100 text-amber-800',
  contract_signed: 'bg-purple-100 text-purple-800',
  in_development: 'bg-teal-100 text-teal-800',
  done: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
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
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  )
}
