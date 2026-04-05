import { createClient } from '@/lib/supabase/server'
import ProfileContent from './components/ProfileContent'

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

async function getCurrentUser(): Promise<UserData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('id, full_name, phone, avatar_url, telegram_chat_id, notification_preferences')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    full_name: userData?.full_name || null,
    phone: userData?.phone || null,
    avatar_url: userData?.avatar_url || null,
    telegram_chat_id: userData?.telegram_chat_id || null,
    notification_preferences: userData?.notification_preferences || {
      new_orders: true,
      status_changes: true,
      new_messages: true,
    },
  }
}

export default async function ClientProfilePage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 font-mono">
          <h1 className="text-xl font-semibold text-red-400 mb-2">// Ошибка</h1>
          <p className="text-red-300">Необходимо авторизоваться</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile content */}
      <ProfileContent userData={currentUser} />
    </div>
  )
}
