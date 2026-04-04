import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Order } from '@agency/types'

// ============================================================================
// MANAGER ORDERS PAGE
// ============================================================================
// Отображает все заявки в виде кода с подсветкой синтаксиса
// ============================================================================

async function getManagerOrders(): Promise<Order[]> {
  console.log('[MANAGER PAGE] Fetching manager orders')

  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('[MANAGER PAGE] User:', user?.id, 'Error:', userError)

  if (!user) {
    console.log('[MANAGER PAGE] No user found')
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

  console.log('[MANAGER PAGE] Orders:', data, 'Error:', error)

  if (error) {
    console.error('[MANAGER PAGE] Error fetching orders:', error)
    return []
  }

  return data || []
}

function getManagerStatusColor(status: string | null | undefined): string {
  const colors: Record<string, string> = {
    'brief_ready': 'text-primary',
    'negotiation': 'text-amber-400',
    'contract': 'text-purple-400',
    'cancelled': 'text-red-400',
  }
  return status ? colors[status] || 'text-gray-400' : 'text-gray-400'
}

function getManagerStatusText(status: string | null | undefined): string {
  const texts: Record<string, string> = {
    'brief_ready': 'Бриф готов',
    'negotiation': 'Переговоры',
    'contract': 'Договор',
    'cancelled': 'Отклонён',
  }
  return status ? texts[status] || '—' : '—'
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
          <div className="space-y-4 pt-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/manager/orders/${order.id}`}
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

                  {/* Manager status - fixed width */}
                  <span className={`${getManagerStatusColor(order.manager_status)} w-36 shrink-0 flex items-center gap-2 whitespace-nowrap`}>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getManagerStatusColor(order.manager_status).replace('text-', 'bg-')}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${getManagerStatusColor(order.manager_status).replace('text-', 'bg-')}`}></span>
                    </span>
                    {getManagerStatusText(order.manager_status)}
                  </span>

                  {/* Extra gap between status and client */}
                  <span className="w-8 shrink-0"></span>

                  {/* Client - fixed width */}
                  <span className="text-muted-foreground w-44 shrink-0 truncate">
                    {'〖' + (order.client_name || order.client?.full_name || order.client?.email || 'Unknown') + '〗'}
                  </span>

                  {/* Commission - fixed width */}
                  <span className="text-primary/70 w-36 shrink-0">
                    {order.manager_commission ? `// ${order.manager_commission.toLocaleString('ru-RU')} ₽ //` : '// — //'}
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
