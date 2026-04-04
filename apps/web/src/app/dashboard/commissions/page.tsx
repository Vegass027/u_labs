import { createClient } from '@/lib/supabase/server'
import { CommissionsClient } from './components/CommissionsClient'

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
  
  const commissions = await getCommissions({ status: searchParams.status })
  
  return <CommissionsClient commissions={commissions} searchParams={searchParams} />
}
