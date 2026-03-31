'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  const inputRefs = {
    client_name: useRef<HTMLInputElement>(null),
    client_email: useRef<HTMLInputElement>(null),
    title: useRef<HTMLInputElement>(null),
    raw_text: useRef<HTMLTextAreaElement>(null),
  }

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  const handleContainerClick = (fieldName: string) => {
    inputRefs[fieldName as keyof typeof inputRefs]?.current?.focus()
  }

  useEffect(() => {
    // Автофокус на первое поле
    inputRefs.client_name.current?.focus()
  }, [])

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
        <span className="text-green-500 text-lg">&lt;&lt;&lt;</span>
        <span className="text-lg font-semibold">Мои заявки</span>
      </Link>

      {/* Form container */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h1 className="text-lg font-bold text-foreground font-mono">Новая заявка</h1>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm font-mono text-red-400 px-3 py-2 rounded bg-red-500/10">
            <span className="font-bold">[error]</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* Client Name */}
          <div>
            <label htmlFor="client_name" className="block text-xs text-muted-foreground mb-1">
              Имя клиента
            </label>
            <div
              className="relative w-full border border-border rounded focus-within:border-primary/50 bg-card cursor-text"
              onClick={() => handleContainerClick('client_name')}
            >
              <div className="relative flex items-center min-w-0 px-3 py-2 min-h-[40px]">
                <input
                  ref={inputRefs.client_name}
                  id="client_name"
                  name="client_name"
                  type="text"
                  value={formData.client_name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('client_name')}
                  onBlur={handleBlur}
                  required
                  className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10"
                />
                <span className="font-mono text-sm whitespace-pre pointer-events-none text-terminal-prompt">
                  {formData.client_name}
                </span>
                {focusedField === 'client_name' && (
                  <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          {/* Client Email */}
          <div>
            <label htmlFor="client_email" className="block text-xs text-muted-foreground mb-1">
              Email клиента
            </label>
            <div
              className="relative w-full border border-border rounded focus-within:border-primary/50 bg-card cursor-text"
              onClick={() => handleContainerClick('client_email')}
            >
              <div className="relative flex items-center min-w-0 px-3 py-2 min-h-[40px]">
                <input
                  ref={inputRefs.client_email}
                  id="client_email"
                  name="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('client_email')}
                  onBlur={handleBlur}
                  required
                  className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10"
                />
                <span className="font-mono text-sm whitespace-pre pointer-events-none text-terminal-prompt">
                  {formData.client_email}
                </span>
                {focusedField === 'client_email' && (
                  <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs text-muted-foreground mb-1">
              Название заявки
            </label>
            <div
              className="relative w-full border border-border rounded focus-within:border-primary/50 bg-card cursor-text"
              onClick={() => handleContainerClick('title')}
            >
              <div className="relative flex items-center min-w-0 px-3 py-2 min-h-[40px]">
                <input
                  ref={inputRefs.title}
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  onFocus={() => handleFocus('title')}
                  onBlur={handleBlur}
                  required
                  className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10"
                />
                <span className="font-mono text-sm whitespace-pre pointer-events-none text-terminal-prompt">
                  {formData.title}
                </span>
                {focusedField === 'title' && (
                  <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="raw_text" className="block text-xs text-muted-foreground mb-1">
              Описание
            </label>
            <div className="relative w-full border border-border rounded focus-within:border-primary/50 bg-card">
              <textarea
                ref={inputRefs.raw_text}
                id="raw_text"
                name="raw_text"
                value={formData.raw_text}
                onChange={handleChange}
                onFocus={() => handleFocus('raw_text')}
                onBlur={handleBlur}
                rows={6}
                className="w-full px-3 py-2 bg-transparent border-none outline-none text-terminal-prompt font-mono text-sm cursor-text resize-none terminal-cursor-block"
              ></textarea>
            </div>
          </div>

 {/* Submit button */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-mono text-muted-foreground">
              <span className="text-terminal-comment">//</span> создать заявку{' '}
            </p>
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