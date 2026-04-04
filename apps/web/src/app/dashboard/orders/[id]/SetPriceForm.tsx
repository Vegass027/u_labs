'use client'

import { useState } from 'react'
import { setOrderPrice } from '@/app/actions/orders'

interface SetPriceFormProps {
  orderId: string
  currentPrice: number | null | undefined
}

export function SetPriceForm({ orderId, currentPrice }: SetPriceFormProps) {
  const [price, setPrice] = useState(currentPrice?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('цена должна быть положительным числом')
      return
    }

    setLoading(true)

    const result = await setOrderPrice(orderId, priceValue)

    if (result.error) {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <h3 className="text-sm font-bold text-foreground font-mono mb-2">
        <span className="text-[#dcb67a]">//</span> Set Price
      </h3>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="flex-1 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary/50 bg-card font-mono terminal-cursor-block text-green-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 text-primary rounded text-sm font-mono hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-primary">
            {loading ? 'устанавливаем...' : './set-price'}
          </span>
        </button>
      </div>
      {error && (
        <div className="mt-2 text-sm font-mono text-red-400 px-3 py-2 rounded bg-red-500/10 border border-red-500/20">
          <span className="font-bold">[error]</span> {error}
        </div>
      )}
    </form>
  )
}
