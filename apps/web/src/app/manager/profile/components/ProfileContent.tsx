'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import AvatarUploadClient from './AvatarUpload'
import ProfileFieldClient from './ProfileField'
import TelegramSectionClient from './TelegramSection'
import NotificationPreferencesClient from './NotificationPreferences'

interface UserData {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  telegram_chat_id: string | null
  notification_preferences: {
    new_orders: boolean
    status_changes: boolean
    new_messages: boolean
  }
}

interface ProfileContentProps {
  userData: UserData
}

export default function ProfileContent({ userData }: ProfileContentProps) {
  const router = useRouter()
  const [notificationPreferences, setNotificationPreferences] = useState(
    userData.notification_preferences || {
      new_orders: true,
      status_changes: true,
      new_messages: true,
    }
  )

  const handleAvatarChange = async (url: string | null) => {
    const response = await api.patch('/api/auth/profile', { avatar_url: url })
    if (response.error) throw new Error(response.error)
    router.refresh()
  }

  const handleNameSave = async (name: string) => {
    const response = await api.patch('/api/auth/profile', { full_name: name })
    if (response.error) throw new Error(response.error)
    router.refresh()
  }

  const handlePhoneSave = async (phone: string) => {
    const response = await api.patch('/api/auth/profile', { phone: phone || '' })
    if (response.error) throw new Error(response.error)
    router.refresh()
  }

  const handleTelegramUnlink = async () => {
    const response = await api.patch('/api/auth/me', { telegram_chat_id: null })
    if (response.error) throw new Error(response.error)
    router.refresh()
  }

  const handleNotificationUpdate = async (prefs: {
    new_orders: boolean
    status_changes: boolean
    new_messages: boolean
  }) => {
    const response = await api.patch('/api/auth/notification-preferences', prefs)
    if (response.error) throw new Error(response.error)
    setNotificationPreferences(prefs)
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground font-mono mb-2">
          ~/profile.ts — настройки профиля
        </h1>
        <p className="text-sm text-muted-foreground">
          Управление вашим профилем и настройками уведомлений
        </p>
      </div>

      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <AvatarUploadClient
            currentAvatar={userData.avatar_url || undefined}
            onAvatarChange={handleAvatarChange}
          />
        </div>

        {/* Profile Fields */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <ProfileFieldClient
            label="Имя"
            value={userData.full_name || ''}
            onSave={handleNameSave}
          />

          <ProfileFieldClient
            label="Телефон"
            value={userData.phone || ''}
            onSave={handlePhoneSave}
            isPhone={true}
          />

          <ProfileFieldClient
            label="Email"
            value={userData.email}
            onSave={() => {
              throw new Error('Email cannot be changed')
            }}
            editable={false}
          />
        </div>

        {/* Telegram Section */}
        <TelegramSectionClient
          isLinked={!!userData.telegram_chat_id}
          chatId={userData.telegram_chat_id || undefined}
          onUnlink={handleTelegramUnlink}
        />

        {/* Notification Preferences */}
        <NotificationPreferencesClient
          preferences={notificationPreferences}
          onUpdate={handleNotificationUpdate}
          enabled={!!userData.telegram_chat_id}
        />
      </div>
    </div>
  )
}
