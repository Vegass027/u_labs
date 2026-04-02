'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface RawTextEditorProps {
  orderId: string
  initialText?: string | null
}

export function RawTextEditor({ orderId, initialText }: RawTextEditorProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState(initialText || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      const scrollY = window.scrollY
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      window.scrollTo(0, scrollY)
    }
  }, [text, isEditing])

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      const { error: apiError } = await api.patch(`/api/manager/orders/${orderId}/raw_text`, {
        raw_text: text,
      })

      if (apiError) {
        setError(apiError)
        return
      }

      router.refresh()
      setIsEditing(false)
    } catch {
      setError('произошла ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setText(initialText || '')
    setError('')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('не удалось скопировать текст')
    }
  }

  // Подсвечиваем заголовки в тексте брифа
  const formatText = (text: string) => {
    if (!text) return text
    // Заменяем заголовки на span с цветом как у стрелочек >>> (#dcb67a)
    return text
      .replace(/^(Резюме:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Проблема:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Текущий процесс:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Желаемый результат:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Целевая аудитория:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Функции:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Интеграции:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Бюджет:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Срок:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Технические подсказки:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
      .replace(/^(Уточняющие вопросы:)$/gm, '<span class="text-[#dcb67a]">$1</span>')
  }

  // Режим просмотра
  if (!isEditing) {
    if (text) {
      return (
        <div className="relative">
          <div className="absolute top-0 right-0 flex gap-2">
            <button
              onClick={handleCopy}
              className="w-8 h-8 rounded border border-green-500/50 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 transition-colors"
              title="Копировать"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleEdit}
              className="w-8 h-8 rounded border border-green-500/50 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 transition-colors"
              title="Редактировать"
            >
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <pre 
            className="text-sm text-foreground whitespace-pre-wrap font-mono pr-20"
            dangerouslySetInnerHTML={{ __html: formatText(text) }}
          />
        </div>
      )
    }

    // Пустой бриф - только кнопка редактирования
    return (
      <div className="flex justify-end">
        <button
          onClick={handleEdit}
          className="w-8 h-8 rounded border border-green-500/50 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 transition-colors"
          title="Редактировать"
        >
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    )
  }

  // Режим редактирования
  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm font-mono text-red-400 px-3 py-2 rounded bg-red-500/10 border border-red-500/20">
          <span className="font-bold">[error]</span> {error}
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary/50 bg-card resize-none text-sm font-mono terminal-cursor-block overflow-hidden"
          style={{ minHeight: '200px' }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-mono whitespace-nowrap">// сохранить</span>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 text-primary rounded text-sm font-mono hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-primary">
              {loading ? 'сохраняем...' : './save-raw-text'}
            </span>
          </button>
        </div>

        {initialText && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-mono whitespace-nowrap">// отмена</span>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 text-primary rounded text-sm font-mono hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-primary">
                ./cancel
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
