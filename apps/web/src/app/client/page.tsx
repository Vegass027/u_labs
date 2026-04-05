import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import type { Order } from '@agency/types'

async function getClientOrders(): Promise<Order[]> {
  const supabase = await createClient()

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
    <div className="max-w-6xl mx-auto space-y-4">
      {/* // ============================================================
          // HEADER SECTION
          // ============================================================ */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg text-foreground font-mono">
          <span className="font-bold">// Мои заявки // -&gt;</span> <span className="text-[#dcb67a]">Все ваши заявки:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-foreground">
            // создать заявку
          </span>
          <Link
            href="/client/orders/new"
            className="inline-block px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-terminal-prompt hover:text-glow-sm text-sm font-mono"
          >
            ~/create-order
          </Link>
        </div>
      </div>

       {/* // ============================================================
          // ORDERS LIST - CODE STYLE WITH FIXED COLUMNS
          // ============================================================ */}
      <div className="font-mono text-sm">
        {orders.length === 0 ? (
          <div className="text-muted-foreground text-xs">
            <div className="text-terminal-comment mb-2">// заявок пока нет</div>
            <div>// создайте первую заявку, чтобы начать работу</div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/client/orders/${order.id}`}
                className="flex items-center hover:bg-muted/50 transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(74,222,128,0.3),0_-4px_20px_-4px_rgba(74,222,128,0.3)] rounded px-3 py-4 group"
              >
                {/* Code content with fixed columns */}
                <div className="flex-1 flex items-center gap-4">
                  {/* Arrow indicator */}
                  <span className="text-[#dcb67a] text-xs shrink-0">
                    &gt;&gt;&gt;
                  </span>

                  {/* Order title - fixed width */}
                  <span className="text-primary font-medium w-56 shrink-0 truncate">
                    {order.title}
                  </span>

                  {/* Status - fixed width */}
                  <span className="w-36 shrink-0">
                    <StatusBadge status={order.status} />
                  </span>

                  {/* Extra gap between status and manager */}
                  <span className="w-8 shrink-0"></span>

                  {/* Manager - fixed width */}
                  <span className="text-muted-foreground w-44 shrink-0 truncate">
                    {'〖' + (order.manager?.full_name || order.manager?.email || 'Не назначен') + '〗'}
                  </span>

                  {/* Date - fixed width */}
                  <span className="text-muted-foreground/60 text-xs w-36 shrink-0">
                    {'[' + new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ']'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
