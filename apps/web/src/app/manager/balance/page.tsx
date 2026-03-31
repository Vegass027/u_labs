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
    console.error('Failed to fetch manager balance:', error)
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
    console.error('Failed to fetch manager commissions:', error)
    return []
  }
  
  return commissions || []
}

export default async function ManagerBalancePage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== 'manager') {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-900 mb-2">Ошибка</h1>
          <p className="text-red-700">Доступ запрещен</p>
        </div>
      </div>
    )
  }
  
  const balance = await getManagerBalance(currentUser.id)
  const commissions = await getManagerCommissions(currentUser.id)
  
  if (!balance) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-900 mb-2">Ошибка</h1>
          <p className="text-red-700">Профиль менеджера не найден</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Баланс менеджера</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Зарезервировано</h2>
          <p className="text-3xl font-bold text-gray-600">
            ${balance.balance_reserved?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Комиссии по активным заказам
          </p>
        </div>
        
        <div className="bg-white border border-amber-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">К выплате</h2>
          <p className="text-3xl font-bold text-amber-600">
            ${balance.balance_payable?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Комиссии по завершённым заказам
          </p>
        </div>
        
        <div className="bg-white border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Выплачено</h2>
          <p className="text-3xl font-bold text-green-600">
            ${balance.balance_paid?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Выплаченные комиссии
          </p>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">История комиссий</h2>
        </div>
        
        {commissions.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            Комиссии не найдены
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создана
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Выплачена
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(commission.order as any)?.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${commission.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        commission.tx_status === 'reserved'
                          ? 'bg-gray-100 text-gray-800'
                          : commission.tx_status === 'payable'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {commission.tx_status === 'reserved'
                        ? 'Зарезервирована'
                        : commission.tx_status === 'payable'
                        ? 'К выплате'
                        : 'Выплачена'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(commission.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.paid_at
                      ? new Date(commission.paid_at).toLocaleDateString('ru-RU')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
