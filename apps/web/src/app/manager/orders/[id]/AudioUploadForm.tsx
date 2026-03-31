'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AudioUploadFormProps {
  orderId: string
}

export function AudioUploadForm({ orderId }: AudioUploadFormProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/manager/orders/${orderId}/audio`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload audio')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Загрузить аудио</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-2">
            Аудиофайл
          </label>
          <input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors"
        >
          {uploading ? 'Загрузка...' : 'Загрузить'}
        </button>
      </form>
    </div>
  )
}
