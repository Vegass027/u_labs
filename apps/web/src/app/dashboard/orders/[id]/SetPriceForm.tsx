'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface SetPriceFormProps {
  orderId: string
  currentPrice: number | null | undefined
}

export function SetPriceForm({ orderId, currentPrice }: SetPriceFormProps) {
  const [price, setPrice] = useState(currentPrice?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Price must be a positive number')
      return
    }

    setLoading(true)

    try {
      const { error } = await api.patch(`/api/admin/orders/${orderId}/price`, { price: priceValue })

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
      <h3 className="text-sm font-medium text-gray-700 mb-2">Set Price</h3>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting...' : 'Set Price'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  )
}
