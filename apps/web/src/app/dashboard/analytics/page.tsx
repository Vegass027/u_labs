import { createClient } from '@/lib/supabase/server'
import { AnalyticsClient } from './components/AnalyticsClient'
import type { RevenueAnalytics, RevenueCategory, MonthlyRevenue } from '@agency/types'

interface OrderRow {
  price: number | null
  manager_commission: number | null
  manager_user_id: string | null
  client_user_id: string | null
  created_at: string
}

function emptyCategory(label: string): RevenueCategory {
  return {
    label,
    total_revenue: 0,
    total_gross: 0,
    total_commission: 0,
    orders_count: 0,
  }
}

function computeAnalytics(orders: OrderRow[]): RevenueAnalytics {
  const ownerDirect = emptyCategory('Личные заказы')
  const viaManagers = emptyCategory('Через менеджеров')
  const selfClients = emptyCategory('Самостоятельные клиенты')
  const monthlyMap = new Map<string, MonthlyRevenue>()

  for (const order of orders) {
    const price = Number(order.price) || 0
    const commission = Number(order.manager_commission) || 0
    const month = order.created_at.substring(0, 7)

    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, {
        month,
        owner_direct: 0,
        via_managers: 0,
        self_clients: 0,
        total: 0,
        orders_count: 0,
      })
    }
    const m = monthlyMap.get(month)!

    if (order.manager_user_id) {
      const revenue = price - commission
      viaManagers.total_revenue += revenue
      viaManagers.total_gross += price
      viaManagers.total_commission += commission
      viaManagers.orders_count++
      m.via_managers += revenue
    } else if (order.client_user_id) {
      selfClients.total_revenue += price
      selfClients.total_gross += price
      selfClients.orders_count++
      m.self_clients += price
    } else {
      ownerDirect.total_revenue += price
      ownerDirect.total_gross += price
      ownerDirect.orders_count++
      m.owner_direct += price
    }

    m.orders_count++
    m.total += order.manager_user_id ? price - commission : price
  }

  return {
    all_time: {
      owner_direct: ownerDirect,
      via_managers: viaManagers,
      self_clients: selfClients,
      total_revenue: ownerDirect.total_revenue + viaManagers.total_revenue + selfClients.total_revenue,
      total_gross: ownerDirect.total_gross + viaManagers.total_gross + selfClients.total_gross,
      total_orders: orders.length,
    },
    monthly: Array.from(monthlyMap.values()),
  }
}

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('price, manager_commission, manager_user_id, client_user_id, created_at')
    .eq('status', 'done')
    .not('price', 'is', null)
    .order('created_at', { ascending: true })

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400 font-mono text-sm">Ошибка загрузки аналитики</p>
        </div>
      </div>
    )
  }

  const analytics = computeAnalytics((orders || []) as OrderRow[])

  return <AnalyticsClient analytics={analytics} />
}
