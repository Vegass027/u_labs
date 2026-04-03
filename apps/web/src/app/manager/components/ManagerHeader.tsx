'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth'

interface Notification {
  id: string
  order_id: string
  type: 'new_order' | 'status_change' | 'new_message'
  title: string
  body?: string
  is_read: boolean
  created_at: string
}

interface ManagerHeaderProps {
  currentUserId: string
  userName: string
  userEmail: string
  avatarUrl?: string | null
}

export default function ManagerHeader({ currentUserId, userName, userEmail, avatarUrl }: ManagerHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
    subscribeToNotifications()

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      supabase.channel('notifications').unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [currentUserId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.slice(0, 10))
        const unread = data.filter((n: Notification) => !n.is_read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const subscribeToNotifications = () => {
    supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev].slice(0, 10))
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()
  }

  const handleNotificationClick = async (notification: Notification) => {
    setIsNotificationOpen(false)

    if (!notification.is_read) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
        })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    router.push(`/manager/orders/${notification.order_id}`)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Только что'
    if (diffMins < 60) return `${diffMins} мин назад`
    if (diffHours < 24) return `${diffHours} ч назад`
    if (diffDays < 7) return `${diffDays} д назад`
    return date.toLocaleDateString('ru-RU')
  }

  const userInitial = userName?.[0] || 'M'

  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsNotificationOpen(!isNotificationOpen)
          }}
          className="notification-button p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-primary text-background text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-mono">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isNotificationOpen && (
          <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-border">
              <h3 className="font-mono text-sm text-foreground">Уведомления</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm font-mono">Нет уведомлений</div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 border-b border-border hover:bg-primary/5 transition-colors ${
                      !notification.is_read ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate font-mono">
                          {notification.title}
                        </p>
                        {notification.body && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {notification.body}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-6 h-6 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-mono">
            {userInitial}
          </div>
        )}
        <div className="text-xs">
          <p className="text-foreground font-medium">{userName || 'Manager'}</p>
          <p className="text-muted-foreground text-[10px] font-mono">{userEmail}</p>
        </div>
      </div>

      {/* Logout Button */}
      <div
        onClick={handleLogout}
        className="flex items-center gap-2 group cursor-pointer"
      >
        <span className="text-[10px] text-muted-foreground font-mono group-hover:text-primary transition-colors">
          // exit
        </span>
        <button
          disabled={isLoggingOut}
          className="w-6 h-6 rounded bg-primary/20 text-primary font-mono text-xs hover:bg-primary hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ~
        </button>
      </div>
    </div>
  )
}
