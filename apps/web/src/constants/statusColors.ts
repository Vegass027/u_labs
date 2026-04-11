import type { OrderStatus } from '@agency/types'

export const STATUS_COLORS = {
  new: {
    border: 'border-blue-500',
    text: 'text-blue-500',
    bg: 'bg-blue-100',
    bgText: 'text-blue-800',
    dot: 'bg-blue-500'
  },
  reviewing: {
    border: 'border-amber-500',
    text: 'text-amber-500',
    bg: 'bg-amber-100',
    bgText: 'text-amber-800',
    dot: 'bg-amber-500'
  },
  proposal_sent: {
    border: 'border-purple-500',
    text: 'text-purple-500',
    bg: 'bg-purple-100',
    bgText: 'text-purple-800',
    dot: 'bg-purple-500'
  },
  contract_signed: {
    border: 'border-green-500',
    text: 'text-green-500',
    bg: 'bg-green-100',
    bgText: 'text-green-800',
    dot: 'bg-green-500'
  },
  in_development: {
    border: 'border-cyan-500',
    text: 'text-cyan-500',
    bg: 'bg-cyan-100',
    bgText: 'text-cyan-800',
    dot: 'bg-cyan-500'
  },
  done: {
    border: 'border-emerald-500',
    text: 'text-emerald-500',
    bg: 'bg-emerald-100',
    bgText: 'text-emerald-800',
    dot: 'bg-emerald-500'
  },
  rejected: {
    border: 'border-red-500',
    text: 'text-red-500',
    bg: 'bg-red-100',
    bgText: 'text-red-800',
    dot: 'bg-red-500'
  }
} as const satisfies Record<OrderStatus, {
  border: string
  text: string
  bg: string
  bgText: string
  dot: string
}>

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'новая',
  reviewing: 'на рассмотрении',
  proposal_sent: 'предложение отправлено',
  contract_signed: 'договор подписан',
  in_development: 'в разработке',
  done: 'выполнено',
  rejected: 'отклонено',
}
