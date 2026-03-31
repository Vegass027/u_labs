'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RestructureButtonProps {
  orderId: string
  rawText?: string | null
}

export function RestructureButton({ orderId, rawText }: RestructureButtonProps) {
  const router = useRouter()
  const [restructuring, setRestructuring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRestructure = async () => {
    if (!rawText || rawText.trim().length < 10) {
      setError('Недостаточно текста для реструктурирования')
      return
    }

    setRestructuring(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/structure', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: rawText,
          order_id: orderId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to restructure brief')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restructure brief')
    } finally {
      setRestructuring(false)
    }
  }

  if (!rawText) {
    return null
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleRestructure}
        disabled={restructuring}
        className="bg-purple-600 text-white py-2 px-4 rounded-md
          hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500
          disabled:bg-gray-300 disabled:cursor-not-allowed
          transition-colors"
      >
        {restructuring ? 'Реструктурирование...' : 'Переструктурировать'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
