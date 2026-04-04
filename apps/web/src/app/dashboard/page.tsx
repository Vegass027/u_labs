import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Order, OrderStatus } from '@agency/types'

// ============================================================================
// OWNER ORDERS PAGE
// ============================================================================
// Отображает все заявки в виде кода с подсветкой синтаксиса
// ============================================================================

interface DashboardPageProps {
  searchParams: { status?: string }
}

async function getOrders(status?: OrderStatus | null): Promise<Order[]> {
  const supabase = await createClient()

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

function getOwnerStatusColor(status: string | null | undefined): string {
  const colors: Record<string, string> = {
    'new': 'text-primary',
    'reviewing': 'text-amber-400',
    'proposal_sent': 'text-purple-400',
    'contract_signed': 'text-cyan-400',
    'in_development': 'text-green-400',
    'done': 'text-green-500',
    'rejected': 'text-red-400',
  }
  return status ? colors[status] || 'text-gray-400' : 'text-gray-400'
}

function getOwnerStatusText(status: string | null | undefined): string {
  const texts: Record<string, string> = {
    'new': 'Новая',
    'reviewing': 'На рассмотрении',
    'proposal_sent': 'Предложение отправлено',
    'contract_signed': 'Договор подписан',
    'in_development': 'В разработке',
    'done': 'Готово',
    'rejected': 'Отклонена',
  }
  return status ? texts[status] || '—' : '—'
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const orders = await getOrders(searchParams.status as OrderStatus | null)

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* // ============================================================
          // HEADER SECTION
          // ============================================================ */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg text-foreground font-mono">
          <span className="font-bold">// Все заявки // -&gt;</span> <span className="text-[#dcb67a]">Все заявки в системе:</span>
        </div>
      </div>

      {/* // ============================================================
          // FILTER BUTTONS
          // ============================================================ */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-mono text-terminal-comment mr-2">// фильтр по статусу:</span>
        <Link
          href="/dashboard"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${!searchParams.status ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #all
        </Link>
        <Link
          href="/dashboard?status=new"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'new' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #new
        </Link>
        <Link
          href="/dashboard?status=reviewing"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'reviewing' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #reviewing
        </Link>
        <Link
          href="/dashboard?status=proposal_sent"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'proposal_sent' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #proposal-sent
        </Link>
        <Link
          href="/dashboard?status=contract_signed"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'contract_signed' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #contract
        </Link>
        <Link
          href="/dashboard?status=in_development"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'in_development' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #in-dev
        </Link>
        <Link
          href="/dashboard?status=done"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'done' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #done
        </Link>
        <Link
          href="/dashboard?status=rejected"
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'rejected' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
        >
          #rejected
        </Link>
      </div>

      {/* // ============================================================
          // ORDERS LIST - CODE STYLE WITH FIXED COLUMNS
          // ============================================================ */}
      <div className="font-mono text-sm">
        {orders.length === 0 ? (
          <div className="text-muted-foreground text-xs">
            <div className="text-terminal-comment mb-2">// заявок пока нет</div>
            <div>// ожидайте появления новых заявок</div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
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
                  <span className={`${getOwnerStatusColor(order.status)} w-36 shrink-0 flex items-center gap-2 whitespace-nowrap`}>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getOwnerStatusColor(order.status).replace('text-', 'bg-')}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${getOwnerStatusColor(order.status).replace('text-', 'bg-')}`}></span>
                    </span>
                    {getOwnerStatusText(order.status)}
                  </span>

                  {/* Extra gap between status and client */}
                  <span className="w-8 shrink-0"></span>

                  {/* Client - fixed width */}
                  <span className="text-muted-foreground w-44 shrink-0 truncate">
                    {'〖' + (order.client_name || order.client?.full_name || order.client?.email || 'Unknown') + '〗'}
                  </span>

                  {/* Manager - fixed width */}
                  <span className="text-muted-foreground w-44 shrink-0 truncate">
                    {'〖' + (order.manager?.full_name || order.manager?.email || 'Unassigned') + '〗'}
                  </span>

                  {/* Price - fixed width */}
                  <span className="text-primary/70 w-36 shrink-0">
                    {order.price ? `// ${order.price.toLocaleString('ru-RU')} ₽ //` : '// — //'}
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
