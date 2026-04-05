'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function NewClientOrderPage() {
  const [formData, setFormData] = useState({
    title: '',
    raw_text: '',
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
      setError('Название обязательно')
      return
    }

    setLoading(true)

    try {
      const { data, error: apiError } = await api.post('/api/orders', {
        title: formData.title,
        raw_text: formData.raw_text || undefined,
      })

      if (apiError) {
        setError(apiError)
        return
      }

      router.push('/client')
    } catch (err) {
      setError('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* // ============================================================
          // HEADER SECTION
          // ============================================================ */}
      <div className="mb-6">
        <Link
          href="/client"
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="text-[#dcb67a]">&lt;</span>
          <span>// вернуться к заявкам</span>
        </Link>
      </div>

      {/* // ============================================================
          // FORM SECTION
          // ============================================================ */}
      <div className="bg-card/50 border border-border rounded-lg p-6 space-y-6">
        {/* Header */}
        <div className="text-lg text-foreground font-mono">
          <span className="font-bold">// Создать заявку // -&gt;</span> <span className="text-[#dcb67a]">Новый проект:</span>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded font-mono text-sm">
            <span className="text-red-400">// error: </span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title field */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-mono text-muted-foreground">
              // название заявки
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Введите название проекта"
              className="w-full px-3 py-2 bg-transparent border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono text-sm placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <label htmlFor="raw_text" className="text-sm font-mono text-muted-foreground">
              // описание (опционально)
            </label>
            <textarea
              id="raw_text"
              name="raw_text"
              value={formData.raw_text}
              onChange={handleChange}
              rows={6}
              placeholder="Опишите ваш проект..."
              className="w-full px-3 py-2 bg-transparent border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono text-sm placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary text-background rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm transition-colors"
          >
            {loading ? '// создание...' : '// создать заявку'}
          </button>
        </form>
      </div>
    </div>
  )
}
