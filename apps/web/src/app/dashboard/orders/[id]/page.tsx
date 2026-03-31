import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/app/dashboard/components/StatusBadge'
import { BriefDisplay } from '@/components/BriefDisplay'
import { RestructureButton } from './RestructureButton'
import { SetPriceForm } from './SetPriceForm'
import { UpdateStatusForm } from './UpdateStatusForm'
import ChatWindow from '@/components/chat/ChatWindow'
import type { Order } from '@agency/types'

async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:users!orders_client_user_id_fkey (
        full_name,
        email,
        phone
      ),
      manager:users!orders_manager_user_id_fkey (
        full_name,
        email
      )
    `)
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Failed to fetch order:', error)
    return null
  }

  return data
}

async function getCurrentUser() {
  const supabase = createClient()
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

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)
  const currentUser = await getCurrentUser()

  if (!order) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Order Not Found</h1>
        <p className="text-gray-600">The order you're looking for doesn't exist.</p>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Unauthorized</h1>
        <p className="text-gray-600">Please log in to view this order.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <a href="/dashboard" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </a>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{order.title}</h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <span className="text-sm text-gray-600">
                  Created: {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Client Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span>{' '}
                {order.client?.full_name || '-'}
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                {order.client?.email || '-'}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{' '}
                {order.client?.phone || '-'}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Manager Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span>{' '}
                {order.manager?.full_name || 'Not assigned'}
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                {order.manager?.email || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-600">Price:</span>
              <p className="text-xl font-semibold">
                {order.price ? `$${order.price.toLocaleString()}` : 'Not set'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Manager Commission:</span>
              <p className="text-xl font-semibold">
                {order.manager_commission ? `$${order.manager_commission.toLocaleString()}` : '-'}
              </p>
            </div>
          </div>

          {order.raw_text && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Raw Text:</h3>
              <div className="p-4 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
                {order.raw_text}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Structured Brief:</h3>
            <BriefDisplay brief={order.structured_brief || null} />
            <RestructureButton orderId={order.id} rawText={order.raw_text} />
          </div>

          {order.rejection_reason && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rejection Reason:</h3>
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm">
                {order.rejection_reason}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            <SetPriceForm orderId={order.id} currentPrice={order.price} />
            <UpdateStatusForm orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ChatWindow orderId={order.id} currentUserId={currentUser.id} currentUserRole={currentUser.role} />
      </div>
    </div>
  )
}
