import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Order } from '@agency/types'

// ============================================================================
// MANAGER ORDERS PAGE
// ============================================================================
// Отображает все заявки в виде кода с подсветкой синтаксиса
// ============================================================================

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

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'new': 'text-blue-400',
    'in_progress': 'text-yellow-400',
    'review': 'text-purple-400',
    'done': 'text-green-400',
    'cancelled': 'text-red-400',
  }
  return colors[status] || 'text-gray-400'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    'new': 'Новая',
    'in_progress': 'В работе',
    'review': 'На проверке',
    'done': 'Завершена',
    'cancelled': 'Отменена',
  }
  return texts[status] || status
}

export default async function ManagerPage() {
  const orders = await getManagerOrders()

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* // ============================================================
          // HEADER SECTION
          // ============================================================ */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg text-foreground font-mono">
          <span className="font-bold">// Мои заявки // -&gt;</span> <span className="text-[#dcb67a]">Все проекты, которые вы ведёте:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-foreground">
            // создать заявку
          </span>
          <Link
            href="/manager/orders/new"
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
          <div className="space-y-0 pt-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/manager/orders/${order.id}`}
                className="flex items-center hover:bg-muted/50 transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(74,222,128,0.3),0_-4px_20px_-4px_rgba(74,222,128,0.3)] rounded px-3 py-4 mb-4 group"
              >
                {/* Code content with fixed columns */}
                <div className="flex-1 flex items-center gap-4">
                  {/* Arrow indicator */}
                  <span className="text-primary/50 text-xs shrink-0">
                    &gt;&gt;&gt;
                  </span>

                  {/* Order title - fixed width */}
                  <span className="text-primary font-medium w-64 shrink-0 truncate">
                    {order.title}
                  </span>

                  {/* Status - fixed width */}
                  <span className={`${getStatusColor(order.status)} w-32 shrink-0`}>
                    #{getStatusText(order.status)}
                  </span>

                  {/* Client - fixed width */}
                  <span className="text-muted-foreground w-48 shrink-0 truncate">
                    {'{' + (order.client?.full_name || order.client?.email || 'Unknown') + '}'}
                  </span>

                  {/* Commission - fixed width */}
                  <span className="text-primary/70 w-32 shrink-0">
                    {order.manager_commission ? `// ${order.manager_commission.toLocaleString('ru-RU')} ₽` : '// —'}
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
