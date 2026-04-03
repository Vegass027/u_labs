'use client'

import { useState } from 'react'

interface NotificationPreferences {
  new_orders: boolean
  status_changes: boolean
  new_messages: boolean
}

interface NotificationPreferencesProps {
  preferences: NotificationPreferences
  onUpdate: (preferences: NotificationPreferences) => Promise<void>
  enabled: boolean
}

export default function NotificationPreferences({
  preferences,
  onUpdate,
  enabled
}: NotificationPreferencesProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async (key: keyof NotificationPreferences) => {
    setIsUpdating(true)
    try {
      await onUpdate({
        ...preferences,
        [key]: !preferences[key],
      })
    } catch (error) {
      console.error('Update error:', error)
      alert('Ошибка при обновлении настроек')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!enabled) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          Сначала привяжите Telegram для настройки уведомлений
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
        Уведомления Telegram
      </h3>

      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={preferences.new_orders}
              onChange={() => handleToggle('new_orders')}
              disabled={isUpdating}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-border rounded bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">Новые заявки</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Уведомления о создании новых заказов
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={preferences.status_changes}
              onChange={() => handleToggle('status_changes')}
              disabled={isUpdating}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-border rounded bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">Изменения статусов</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Уведомления об изменении статуса заказов
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={preferences.new_messages}
              onChange={() => handleToggle('new_messages')}
              disabled={isUpdating}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-border rounded bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">Новые сообщения</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Уведомления о новых сообщениях в чате
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
