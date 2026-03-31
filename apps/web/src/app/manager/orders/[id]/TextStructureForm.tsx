'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TextStructureFormProps {
  orderId: string
}

export function TextStructureForm({ orderId }: TextStructureFormProps) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [structuring, setStructuring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 10) {
      setError('Текст должен содержать минимум 10 символов')
      return
    }

    setStructuring(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/structure', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          order_id: orderId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to structure text')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to structure text')
    } finally {
      setStructuring(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Структурировать текст</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Текст заявки
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={structuring}
            rows={6}
            className="block w-full rounded-md border-gray-300 shadow-sm
              focus:border-blue-500 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              sm:text-sm"
            placeholder="Вставьте текст заявки клиента..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={text.trim().length < 10 || structuring}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors"
        >
          {structuring ? 'Структурирование...' : 'Структурировать'}
        </button>
      </form>
    </div>
  )
}
