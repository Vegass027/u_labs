import { createClient } from '@/lib/supabase/server'
import { WithdrawalForm } from './components/WithdrawalForm'
import { WithdrawalRequestsList } from './components/WithdrawalRequestsList'

async function getCurrentUser() {
  const supabase = await createClient()
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
  const supabase = await createClient()
  
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

async function getManagerPaymentDetails(userId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/manager/payment-details`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      cache: 'no-store',
    }
  )
  
  if (!response.ok) {
    return {
      sbp_phone: null,
      card_number: null,
      sbp_comment: null,
    }
  }
  
  return await response.json()
}

async function getManagerCommissions(managerUserId: string) {
  const supabase = await createClient()
  
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
    .eq('manager_user_id', managerUserId)
    .order('created_at', { ascending: false })
  
  if (error) {
    return []
  }
  
  return commissions || []
}

async function getWithdrawalRequests(managerUserId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/manager/withdrawals`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      cache: 'no-store',
    }
  )
  
  if (!response.ok) return []
  
  return await response.json() || []
}

async function getManagerStats(managerUserId: string) {
  const supabase = await createClient()
  
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
  const withdrawals = await getWithdrawalRequests(currentUser.id)
  const stats = await getManagerStats(currentUser.id)
  const paymentDetails = await getManagerPaymentDetails(currentUser.id)
  
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

  const totalBalance = balance.balance_payable || 0
  
   return (
     <div className="max-w-3xl mx-auto space-y-4">
       {/* Balance card */}
       <div className="border border-primary/20 rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">баланс</span>
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-primary text-glow font-mono">
          {totalBalance.toLocaleString('ru-RU')} ₽
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
           <div className="text-lg font-bold text-yellow-500 font-mono">
             {balance.balance_reserved?.toLocaleString('ru-RU') || 0} ₽
           </div>
           <div className="text-[10px] text-muted-foreground mt-1">по активным заказам</div>
         </div>
        <div className="border border-primary/30 rounded-lg p-3 bg-card">
           <div className="text-xs text-primary uppercase tracking-wider mb-1">Заявки на вывод</div>
           <div className="text-lg font-bold text-primary font-mono">
             {withdrawals.filter((w: any) => w.status === 'pending').length}
           </div>
           <div className="text-[10px] text-muted-foreground mt-1">в ожидании</div>
         </div>
      </div>

       {/* Total earned */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">всего начислено</span>
          <span className="text-xs text-green-500 font-mono">за всё время</span>
        </div>
        <div className="text-2xl font-bold text-green-500 font-mono">
           {commissions
             .filter(c => c.tx_status === 'payable' || c.tx_status === 'paid')
             .reduce((sum, c) => sum + c.amount, 0)
             .toLocaleString('ru-RU')} ₽
         </div>
       </div>

       {/* Help text */}
      {/* <div className="text-xs text-muted-foreground">
        <span className="text-primary">→</span> приводишь клиента → создаёшь заявку → система всё оформляет → получаешь 30%
      </div> */}

       {/* Withdrawal form */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
          запрос на вывод средств
        </div>
        <div className="p-4">
          <WithdrawalForm
            balancePayable={balance.balance_payable || 0}
            sbpPhone={paymentDetails.sbp_phone}
            cardNumber={paymentDetails.card_number}
            sbpComment={paymentDetails.sbp_comment}
          />
        </div>
      </div>

       {/* Withdrawal requests */}
       <details className="border border-border rounded-lg overflow-hidden bg-card group">
         <summary className="flex items-center justify-between px-4 py-3 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border cursor-pointer hover:bg-muted/50 transition-colors">
           <span>последние запросы на вывод</span>
           <span className="transform group-open:rotate-180 transition-transform">▼</span>
         </summary>
         <div className="divide-y divide-border">
           {withdrawals.length === 0 ? (
             <div className="px-4 py-4 text-center text-muted-foreground text-xs">
               запросы на вывод не найдены
             </div>
           ) : (
             withdrawals.slice(0, 5).map((withdrawal: any) => (
               <div
                 key={withdrawal.id}
                 className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm"
               >
                 <div className="flex items-center gap-2 min-w-0">
                   <span className="text-muted-foreground shrink-0">
                     {new Date(withdrawal.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                   </span>
                   <span className="text-muted-foreground shrink-0">|</span>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                     withdrawal.status === 'pending'
                       ? 'bg-yellow-500/10 text-yellow-500'
                       : withdrawal.status === 'approved'
                       ? 'bg-green-500/10 text-green-500'
                       : 'bg-red-500/10 text-red-500'
                   }`}>
                     {withdrawal.status === 'pending'
                       ? 'в ожидании'
                       : withdrawal.status === 'approved'
                       ? 'одобрено'
                       : 'отклонено'}
                   </span>
                 </div>
                 <div className="flex items-center gap-2 shrink-0">
                   <span className="text-primary font-mono font-medium">
                     {withdrawal.amount.toLocaleString('ru-RU')} ₽
                   </span>
                 </div>
               </div>
             ))
           )}
         </div>
       </details>

       {/* Transaction log */}
       <details className="border border-border rounded-lg overflow-hidden bg-card group">
         <summary className="flex items-center justify-between px-4 py-3 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border cursor-pointer hover:bg-muted/50 transition-colors">
           <span>последние начисления</span>
           <span className="transform group-open:rotate-180 transition-transform">▼</span>
         </summary>
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
       </details>
    </div>
  )
}
