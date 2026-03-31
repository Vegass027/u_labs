'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

async function getCommissions(filters?: { status?: string }) {
  const supabase = createClient()

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
  
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Комиссии</h1>
        <div className="flex gap-2">
          <a
            href="/dashboard/commissions"
            className={`px-4 py-2 rounded-lg ${
              !searchParams.status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Все
          </a>
          <a
            href="/dashboard/commissions?status=reserved"
            className={`px-4 py-2 rounded-lg ${
              searchParams.status === 'reserved'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Зарезервированы
          </a>
          <a
            href="/dashboard/commissions?status=payable"
            className={`px-4 py-2 rounded-lg ${
              searchParams.status === 'payable'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            К выплате
          </a>
          <a
            href="/dashboard/commissions?status=paid"
            className={`px-4 py-2 rounded-lg ${
              searchParams.status === 'paid'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Выплачены
          </a>
        </div>
      </div>

      {commissions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
          Комиссии не найдены
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Менеджер
                </th>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(commission.manager as any)?.full_name || '-'}
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {commission.tx_status !== 'paid' && (
                      <MarkAsPaidButton commissionId={commission.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function MarkAsPaidButton({ commissionId }: { commissionId: string }) {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleMarkAsPaid = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/commissions/${commissionId}/pay`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to mark commission as paid')
      }

      setIsPaid(true)
      router.refresh()
    } catch (error) {
      console.error('Error marking commission as paid:', error)
      alert('Ошибка при отметке комиссии как оплаченной')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkAsPaid}
      disabled={isPaid || isLoading}
      className={`px-3 py-1 text-sm font-medium rounded ${
        isPaid || isLoading
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {isLoading ? 'Загрузка...' : isPaid ? 'Оплачено' : 'Отметить как оплаченную'}
    </button>
  )
}
