import { createClient } from '@/lib/supabase/server'

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

async function getManagerBalance(userId: string) {
  const supabase = createClient()
  
  const { data: profile, error } = await supabase
    .from('manager_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return profile
}

async function getManagerCommissions(managerUserId: string) {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('manager_profiles')
    .select('id')
    .eq('user_id', managerUserId)
    .single()
  
  if (!profile) return []
  
  const { data: commissions, error } = await supabase
    .from('commission_transactions')
    .select(`
      *,
      order:orders!commission_transactions_order_id_fkey (
        title
      )
    `)
    .eq('manager_id', profile.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return []
  }
  
  return commissions || []
}

async function getManagerStats(managerUserId: string) {
  const supabase = createClient()
  
  // Get orders count and unique clients
  const { data: orders } = await supabase
    .from('orders')
    .select('id, client_user_id, status')
    .eq('manager_user_id', managerUserId)
  
  const totalOrders = orders?.length || 0
  const uniqueClients = new Set(orders?.map(o => o.client_user_id)).size
  const doneOrders = orders?.filter(o => o.status === 'done').length || 0
  const conversionRate = totalOrders > 0 ? Math.round((doneOrders / totalOrders) * 100) : 0
  
  return {
    clients: uniqueClients,
    projects: totalOrders,
    conversion: `${conversionRate}%`
  }
}

export default async function ManagerBalancePage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== 'manager') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="border border-red-500/30 rounded-lg p-6 bg-red-500/5">
          <div className="text-sm font-mono text-red-400">
            <span className="font-bold">[error]</span> доступ запрещён
          </div>
        </div>
      </div>
    )
  }
  
  const balance = await getManagerBalance(currentUser.id)
  const commissions = await getManagerCommissions(currentUser.id)
  const stats = await getManagerStats(currentUser.id)
  
  if (!balance) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="border border-red-500/30 rounded-lg p-6 bg-red-500/5">
          <div className="text-sm font-mono text-red-400">
            <span className="font-bold">[error]</span> профиль менеджера не найден
          </div>
        </div>
      </div>
    )
  }

  const totalBalance = (balance.balance_reserved || 0) + (balance.balance_payable || 0)
  
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Comment */}
      <div className="text-terminal-comment text-xs">
        // тебе не нужно разбираться в разработке, делать проекты или нанимать команду
      </div>

      {/* Balance card */}
      <div className="border border-primary/20 rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">баланс</span>
          <span className="text-xs text-primary font-mono">обновлено только что</span>
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-primary text-glow font-mono">
          {totalBalance.toLocaleString('ru-RU')} ₽
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {balance.balance_payable?.toLocaleString('ru-RU') || 0} ₽ доступно к выводу
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border rounded-lg p-3 text-center bg-card">
          <div className="text-xl font-bold text-foreground font-mono">
            {stats.clients}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">клиентов</div>
        </div>
        <div className="border border-border rounded-lg p-3 text-center bg-card">
          <div className="text-xl font-bold text-foreground font-mono">
            {stats.projects}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">проектов</div>
        </div>
        <div className="border border-border rounded-lg p-3 text-center bg-card">
          <div className="text-xl font-bold text-foreground font-mono">
            {stats.conversion}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">конверсия</div>
        </div>
      </div>

      {/* Balance breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border rounded-lg p-3 bg-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">зарезервировано</div>
          <div className="text-lg font-bold text-muted-foreground font-mono">
            {balance.balance_reserved?.toLocaleString('ru-RU') || 0} ₽
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">по активным заказам</div>
        </div>
        <div className="border border-primary/30 rounded-lg p-3 bg-card">
          <div className="text-xs text-primary uppercase tracking-wider mb-1">к выплате</div>
          <div className="text-lg font-bold text-primary font-mono">
            {balance.balance_payable?.toLocaleString('ru-RU') || 0} ₽
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">по завершённым заказам</div>
        </div>
      </div>

      {/* Transaction log */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
          последние начисления
        </div>
        <div className="divide-y divide-border">
          {commissions.length === 0 ? (
            <div className="px-3 py-4 text-center text-muted-foreground text-xs">
              комиссии не найдены
            </div>
          ) : (
            commissions.slice(0, 10).map((commission) => (
              <div
                key={commission.id}
                className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground shrink-0">
                    {new Date(commission.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <span className="text-foreground truncate">
                    {(commission.order as any)?.title || 'Без названия'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    commission.tx_status === 'reserved'
                      ? 'bg-muted text-muted-foreground'
                      : commission.tx_status === 'payable'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {commission.tx_status === 'reserved'
                      ? 'зарезервирована'
                      : commission.tx_status === 'payable'
                      ? 'к выплате'
                      : 'выведено'}
                  </span>
                  <span className="text-primary font-mono font-medium">
                    +{commission.amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground">
        <span className="text-primary">→</span> приводишь клиента → создаёшь заявку → система всё оформляет → получаешь 30%
      </div>
    </div>
  )
}
