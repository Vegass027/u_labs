'use client'

import { useState } from 'react'

export function AudioUploadForm({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      setError('выберите аудиофайл')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'ошибка при загрузке')
        setLoading(false)
        return
      }

      window.location.reload()
    } catch {
      setError('произошла ошибка')
      setLoading(false)
    }
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
          загрузить аудио
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="text-sm font-mono text-red-400 px-3 py-2 rounded bg-red-500/10 border border-red-500/20">
            <span className="font-bold">[error]</span> {error}
          </div>
        )}
        <div>
          <label htmlFor="audio" className="block text-xs text-muted-foreground mb-1 font-mono">
            аудиофайл
          </label>
          <input
            id="audio"
            name="audio"
            type="file"
            accept="audio/*"
            required
            className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary/50 bg-card text-sm font-mono"
          />
        </div>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded text-sm font-mono hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full justify-center"
        >
          <span className="text-primary">
            {loading ? 'загружаем...' : './upload-audio'}
          </span>
        </button>
      </form>
    </div>
  )
}
