'use client'

import { useState } from 'react'
import { Check, X, ExternalLink } from 'lucide-react'

interface TelegramSectionProps {
  isLinked: boolean
  chatId?: string
  onUnlink: () => Promise<void>
}

export default function TelegramSection({ isLinked, chatId, onUnlink }: TelegramSectionProps) {
  const [isUnlinking, setIsUnlinking] = useState(false)

  const handleUnlink = async () => {
    if (!confirm('Вы уверены, что хотите отвязать Telegram? Вы перестанете получать уведомления.')) {
      return
    }

    setIsUnlinking(true)
    try {
      await onUnlink()
    } catch (error) {
      console.error('Unlink error:', error)
      alert('Ошибка при отвязке Telegram')
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
        Telegram
      </h3>

      {isLinked ? (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Telegram привязан</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Chat ID: {chatId}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-primary/20">
            <button
              onClick={handleUnlink}
              disabled={isUnlinking}
              className="w-full px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded font-mono text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnlinking ? 'Отвязка...' : 'Отвязать Telegram'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Как привязать Telegram</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span>Найдите бота</span>
                <a
                  href="https://t.me/AgencyBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  @AgencyBot
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Отправьте команду <span className="font-mono bg-primary/10 px-1 rounded">/start</span></li>
              <li>Введите ваш email для привязки аккаунта</li>
            </ol>

            <div className="bg-primary/5 border border-primary/20 rounded p-3 mt-4">
              <p className="text-xs text-muted-foreground">
                После привязки вы сможете настраивать типы уведомлений, которые хотите получать в Telegram.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
