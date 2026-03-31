import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from './components/StatusBadge'
import Link from 'next/link'
import type { Order } from '@agency/types'

async function getManagerOrders(): Promise<Order[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:users!orders_client_user_id_fkey (
        full_name,
        email
      )
    `)
    .eq('manager_user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

export default async function ManagerPage() {
  const orders = await getManagerOrders()

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground font-mono">мои заявки</h1>
          <p className="text-xs text-muted-foreground">все проекты, которые вы ведёте</p>
        </div>
        <Link
          href="/manager/orders/new"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-primary/30 text-primary text-xs font-mono hover:bg-primary/10 transition-colors"
        >
          <span>+</span>
          создать заявку
        </Link>
      </div>

      {/* Orders table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_100px_120px_80px_60px] gap-2 px-3 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
          <div>название</div>
          <div>статус</div>
          <div>клиент</div>
          <div>комиссия</div>
          <div>дата</div>
        </div>

        {/* Table body */}
        {orders.length === 0 ? (
          <div className="px-3 py-8 text-center text-muted-foreground text-xs">
            <div className="text-terminal-comment mb-2">// заявок пока нет</div>
            <div>создайте первую заявку, чтобы начать работу</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/manager/orders/${order.id}`}
                className="grid grid-cols-[1fr_100px_120px_80px_60px] gap-2 px-3 py-2 text-xs hover:bg-muted/30 transition-colors items-center"
              >
                <div className="text-foreground truncate font-medium">
                  {order.title}
                </div>
                <div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-muted-foreground truncate">
                  {order.client?.full_name || order.client?.email || '-'}
                </div>
                <div className="text-primary font-mono">
                  {order.manager_commission 
                    ? `${order.manager_commission.toLocaleString('ru-RU')} ₽`
                    : '—'}
                </div>
                <div className="text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground">
        <span className="text-primary">→</span> кликните на заявку, чтобы посмотреть детали и загрузить материалы
      </div>
    </div>
  )
}
