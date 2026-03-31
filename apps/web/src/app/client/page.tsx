import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from './components/StatusBadge'
import type { Order } from '@agency/types'

async function getClientOrders(): Promise<Order[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      manager:users!orders_manager_user_id_fkey (
        full_name,
        email
      )
    `)
    .eq('client_user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch client orders:', error)
    return []
  }

  return data || []
}

export default async function ClientPage() {
  const orders = await getClientOrders()

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <span className="text-gray-400">|</span>
        <a
          href="/client/orders/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Order
        </a>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Manager</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No orders yet. Create your first order!
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      href={`/client/orders/${order.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {order.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.manager?.full_name || order.manager?.email || 'Not assigned'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/client/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
