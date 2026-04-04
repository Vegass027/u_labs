import { createClient } from '@/lib/supabase/server'
import { BriefDisplay } from '@/components/BriefDisplay'
import ChatWindow from '@/components/chat/ChatWindow'
import type { Order } from '@agency/types'

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    role: userData?.role || 'client'
  }
}

async function getOrder(orderId: string, userId: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('client_user_id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch order:', error)
    return null
  }

  return data
}

export default async function ClientOrderDetailPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-900 mb-2">Ошибка</h1>
          <p className="text-red-700">Необходимо авторизоваться</p>
        </div>
      </div>
    )
  }

  const order = await getOrder(params.id, currentUser.id)

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-900 mb-2">Ошибка</h1>
          <p className="text-red-700">Заказ не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{order.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Статус: {order.status}</span>
          {order.created_at && (
            <span>Создан: {new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Бриф</h2>
        <BriefDisplay brief={order.structured_brief ?? null} />
      </div>

      {order.transcript && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Транскрипция</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{order.transcript}</p>
        </div>
      )}

      {order.audio_url && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Аудиофайл</h2>
          <audio controls className="w-full">
            <source src={order.audio_url} type="audio/ogg" />
            Ваш браузер не поддерживает аудио.
          </audio>
        </div>
      )}

      <ChatWindow orderId={order.id} currentUserId={currentUser.id} currentUserRole={currentUser.role} />
    </div>
  )
}
