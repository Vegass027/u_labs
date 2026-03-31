'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function NewManagerOrderPage() {
  const [formData, setFormData] = useState({
    title: '',
    raw_text: '',
    client_name: '',
    client_email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('название обязательно')
      return
    }

    if (!formData.client_name.trim()) {
      setError('имя клиента обязательно')
      return
    }

    if (!formData.client_email.trim()) {
      setError('email клиента обязателен')
      return
    }

    setLoading(true)

    try {
      const { error } = await api.post('/api/manager/orders', {
        title: formData.title,
        raw_text: formData.raw_text || undefined,
        client_name: formData.client_name,
        client_email: formData.client_email,
      })

      if (error) {
        setError(error)
        return
      }

      router.push('/manager')
    } catch {
      setError('произошла ошибка')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back link */}
      <Link
        href="/manager"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
      >
        <span className="text-primary">←</span>
        к списку заявок
      </Link>

      {/* Form container */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h1 className="text-lg font-bold text-foreground font-mono">создать заявку</h1>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm font-mono text-red-400 px-3 py-2 rounded bg-red-500/10">
            <span className="font-bold">[error]</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Name */}
          <div>
            <label htmlFor="client_name" className="block text-xs text-muted-foreground mb-1">
              имя клиента
            </label>
            <input
              id="client_name"
              name="client_name"
              type="text"
              value={formData.client_name}
              onChange={handleChange}
              required
              placeholder="Имя клиента"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary/50 bg-card"
            />
          </div>

          {/* Client Email */}
          <div>
            <label htmlFor="client_email" className="block text-xs text-muted-foreground mb-1">
              email клиента
            </label>
            <input
              id="client_email"
              name="client_email"
              type="email"
              value={formData.client_email}
              onChange={handleChange}
              required
              placeholder="email клиента"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary/50 bg-card"
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs text-muted-foreground mb-1">
              Название
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Название заявки"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary/50 bg-card"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="raw_text" className="block text-xs text-muted-foreground mb-1">
              описание (опциона)
            </label>
            <textarea
              id="raw_text"
              name="raw_text"
              value={formData.raw_text}
              onChange={handleChange}
              rows={6}
              placeholder="Описание заявки (можно голосовой для структуриров брифа)"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary/50 bg-card resize-none"
            ></textarea>
          </div>

{/* Submit button */}
          <div className="flex items-center gap-3 pt-2 px-4 pb-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded text-sm font-mono hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-primary">
                {loading ? 'создаём...' : './create-order'}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}