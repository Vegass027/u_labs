import { createClient } from '@/lib/supabase/server'
import type { Order, OrderStatus } from '@agency/types'
import { StatusBadge } from './components/StatusBadge'

interface DashboardPageProps {
  searchParams: { status?: string }
}

async function getOrders(status?: OrderStatus | null): Promise<Order[]> {
  const supabase = createClient()

  let query = supabase
    .from('orders')
    .select(`
      *,
      client:users!orders_client_user_id_fkey (
        full_name,
        email
      ),
      manager:users!orders_manager_user_id_fkey (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch orders:', error)
    return []
  }

  return data || []
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const orders = await getOrders(searchParams.status as OrderStatus | null)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Orders</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-gray-600">Filter by status:</label>
            <select
              id="status-filter"
              name="status"
              defaultValue={searchParams.status || ''}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="contract_signed">Contract Signed</option>
              <option value="in_development">In Development</option>
              <option value="done">Done</option>
              <option value="rejected">Rejected</option>
            </select>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              Filter
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Manager</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      href={`/dashboard/orders/${order.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {order.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.client?.full_name || order.client?.email || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.manager?.full_name || order.manager?.email || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.price ? `$${order.price.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/dashboard/orders/${order.id}`}
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
