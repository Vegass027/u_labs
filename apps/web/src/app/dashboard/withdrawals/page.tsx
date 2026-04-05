import { createClient } from '@/lib/supabase/server'
import { approveWithdrawal as approveWithdrawalAction, rejectWithdrawal as rejectWithdrawalAction } from '@/app/actions/admin-withdrawals'
import Link from 'next/link'

interface WithdrawalsPageProps {
  searchParams: { status?: string }
}

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

async function getWithdrawalRequests(status?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  
  console.log('[WITHDRAWALS] user:', user?.id, 'token exists:', !!session?.access_token, 'status filter:', status)
  
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals`)
  if (status) {
    url.searchParams.set('status', status)
  }
  
  const response = await fetch(
    url.toString(),
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      cache: 'no-store',
    }
  )
  
  console.log('[WITHDRAWALS] response status:', response.status)
  if (!response.ok) {
    const err = await response.json()
    console.error('[WITHDRAWALS] error:', err)
    return []
  }
  
  return await response.json() || []
}

export default async function WithdrawalsPage({ searchParams }: WithdrawalsPageProps) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="border border-red-500/30 rounded-lg p-6 bg-card">
          <div className="text-red-400 font-mono font-bold text-lg mb-2">[error]</div>
          <div className="text-muted-foreground">доступ запрещён</div>
        </div>
      </div>
    )
  }
  
  const withdrawals = await getWithdrawalRequests(searchParams.status || 'pending')
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 bg-muted/50">
          <h1 className="text-lg font-bold text-foreground font-mono">
            <span className="text-[#dcb67a]">{'>>>'}</span> Запросы на вывод
          </h1>
        </div>
        
        {/* Filter buttons */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-terminal-comment mr-2">// фильтр по статусу:</span>
            <Link
              href="/dashboard/withdrawals?status=pending"
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'pending' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
            >
              #pending
            </Link>
            <Link
              href="/dashboard/withdrawals?status=approved"
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'approved' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
            >
              #approved
            </Link>
            <Link
              href="/dashboard/withdrawals?status=rejected"
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${searchParams.status === 'rejected' ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
            >
              #rejected
            </Link>
            <Link
              href="/dashboard/withdrawals"
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${!searchParams.status ? 'bg-primary text-primary-foreground hover:text-glow-sm' : 'bg-card border border-border hover:border-primary/40 text-muted-foreground'}`}
            >
              #all
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {withdrawals.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              запросы на вывод не найдены
            </div>
          ) : (
            withdrawals.map((withdrawal: any) => (
              <div key={withdrawal.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
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
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(withdrawal.created_at).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground font-mono">
                        <span className="text-primary">manager:</span>
                        <span>{withdrawal.manager?.full_name || 'Unknown'}</span>
                        <span className="text-muted-foreground">{'<' + withdrawal.manager?.email + '>'}</span>
                      </div>
                      
                      {(withdrawal.manager_profile?.sbp_phone || withdrawal.manager_profile?.card_number) && (
                        <div className="flex items-start gap-2 text-muted-foreground font-mono">
                          <span className="text-primary shrink-0">реквизиты:</span>
                          <span className="text-foreground">
                            {withdrawal.manager_profile?.sbp_phone && (
                              <>СБП: {withdrawal.manager_profile.sbp_phone}</>
                            )}
                            {withdrawal.manager_profile?.card_number && (
                              <>Карта: {withdrawal.manager_profile.card_number}</>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {withdrawal.manager_profile?.sbp_comment && (
                        <div className="flex items-start gap-2 text-muted-foreground font-mono">
                          <span className="text-primary shrink-0">комментарий:</span>
                          <span className="text-foreground">{withdrawal.manager_profile.sbp_comment}</span>
                        </div>
                      )}
                      
                      {withdrawal.processed_at && (
                        <div className="flex items-center gap-2 text-muted-foreground font-mono">
                          <span className="text-primary">processed_at:</span>
                          <span>
                            {new Date(withdrawal.processed_at).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-xl font-bold text-primary font-mono">
                      {withdrawal.amount.toLocaleString('ru-RU')} ₽
                    </div>
                    
                    {withdrawal.status === 'pending' && (
                      <div className="flex gap-2">
                        <form action={approveWithdrawalAction}>
                          <input type="hidden" name="withdrawalId" value={withdrawal.id} />
                          <button
                            type="submit"
                            className="px-3 py-1 border border-border rounded text-xs font-medium hover:bg-muted transition-colors"
                          >
                            〖 Yes 〗
                          </button>
                        </form>
                        
                        <form action={rejectWithdrawalAction}>
                          <input type="hidden" name="withdrawalId" value={withdrawal.id} />
                          <button
                            type="submit"
                            className="px-3 py-1 border border-border rounded text-xs font-medium hover:bg-muted transition-colors"
                          >
                            〖 No 〗
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
