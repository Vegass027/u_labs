import { createClient } from '@/lib/supabase/server'
import { CommissionsClient } from './components/CommissionsClient'
import { apiServer } from '@/lib/api-server'
import type { CommissionStatistics } from '@agency/types'

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

async function getCommissions(filters?: { status?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('commission_transactions')
    .select(`
      *,
      manager:users!commission_transactions_manager_user_id_fkey (
        full_name
      ),
      order:orders!commission_transactions_order_id_fkey (
        title
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('tx_status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch commissions:', error)
    return []
  }

  return data || []
}

async function getCommissionStatistics(): Promise<CommissionStatistics> {
  const { data } = await apiServer.get<CommissionStatistics>('/api/admin/commissions/statistics')
  return data || {
    total_payable: 0,
    total_reserved: 0,
    total_paid: 0,
    count_payable: 0,
    count_reserved: 0,
    count_paid: 0,
  }
}

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-900 mb-2">Ошибка</h1>
          <p className="text-red-700">Доступ запрещен</p>
        </div>
      </div>
    )
  }

  const [commissions, statistics] = await Promise.all([
    getCommissions({ status: searchParams.status }),
    getCommissionStatistics()
  ])

  return <CommissionsClient commissions={commissions} statistics={statistics} searchParams={searchParams} />
}
