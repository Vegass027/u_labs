'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@agency/types'

interface UpdateStatusFormProps {
  orderId: string
  currentStatus: OrderStatus
}

export function UpdateStatusForm({ orderId, currentStatus }: UpdateStatusFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (status === currentStatus) {
      return
    }

    setLoading(true)

    try {
      const { error } = await api.patch(`/api/admin/orders/${orderId}/status`, { status })

      if (error) {
        setError(error)
        return
      }

      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Update Status</h3>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="contract_signed">Contract Signed</option>
          <option value="in_development">In Development</option>
          <option value="done">Done</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          type="submit"
          disabled={loading || status === currentStatus}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  )
}
