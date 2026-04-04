'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function setOrderPrice(orderId: string, price: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/price`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({ price }),
    }
  )

  if (!response.ok) {
    const data = await response.json()
    return { error: data.error || 'ошибка при установке цены' }
  }

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath(`/manager/orders/${orderId}`)
  revalidatePath('/dashboard')
  revalidatePath('/manager')

  return { success: true }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({ status }),
    }
  )

  if (!response.ok) {
    const data = await response.json()
    return { error: data.error || 'ошибка при обновлении статуса' }
  }

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath(`/manager/orders/${orderId}`)
  revalidatePath('/dashboard')
  revalidatePath('/manager')

  return { success: true }
}
