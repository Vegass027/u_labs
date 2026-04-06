'use client'

import { useState } from 'react'
import { createIndustryWithRedirect, updateIndustryWithRedirect } from '../../../actions/industries'
import type { IndustryContext } from '@agency/types'

interface IndustryFormProps {
  industry?: IndustryContext | null
  onClose?: () => void
}

export function IndustryForm({ industry, onClose }: IndustryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)

      if (industry) {
        await updateIndustryWithRedirect(industry.id, formData)
      } else {
        await createIndustryWithRedirect(formData)
      }

      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить нишу')
      // Автоматически скрывать ошибку через 5 секунд
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
          <div className="text-sm font-mono text-red-400">
            <span className="font-bold">[error]</span> {error}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          название ниши
        </label>
        <input
          type="text"
          name="name"
          defaultValue={industry?.name || ''}
          required
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          placeholder="например: E-commerce"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          ключевые слова (через запятую)
        </label>
        <textarea
          name="keywords"
          defaultValue={industry?.keywords?.join(', ') || ''}
          required
          rows={2}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="например: магазин, интернет-магазин, e-commerce, продажи онлайн"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          типичные боли клиентов
        </label>
        <textarea
          name="pains"
          defaultValue={industry?.pains || ''}
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Какие проблемы обычно решают клиенты этой ниши?"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          типичные роли в проекте
        </label>
        <textarea
          name="roles"
          defaultValue={industry?.roles || ''}
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Какие роли обычно есть в проектах этой ниши?"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          типичные бизнес-процессы
        </label>
        <textarea
          name="processes"
          defaultValue={industry?.processes || ''}
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Какие бизнес-процессы типичны для этой ниши?"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          типичные интеграции
        </label>
        <textarea
          name="integrations"
          defaultValue={industry?.integrations || ''}
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="С какими сервисами обычно интегрируются проекты этой ниши?"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          важные метрики
        </label>
        <textarea
          name="metrics"
          defaultValue={industry?.metrics || ''}
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Какие метрики важны для клиентов этой ниши?"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          приоритеты для MVP
        </label>
        <textarea
          name="first_release"
          defaultValue={industry?.first_release || ''}
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Что обычно включают в первую версию продукта?"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          типичные заблуждения клиентов
        </label>
        <textarea
          name="misconceptions"
          defaultValue={industry?.misconceptions || ''}
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Какие заблуждения типичны для клиентов этой ниши?"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-card border border-border hover:border-primary/40 rounded-lg text-terminal-prompt hover:text-glow-sm font-mono text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (industry ? '~/updating...' : '~/creating...')
            : (industry ? '~/save-industry' : '~/create-industry')
          }
        </button>
      </div>
    </form>
  )
}
