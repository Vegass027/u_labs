'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveWithdrawal(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  const withdrawalId = formData.get('withdrawalId') as string
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals/${withdrawalId}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to approve withdrawal')
  }
  
  revalidatePath('/dashboard/withdrawals')
}

export async function rejectWithdrawal(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  const withdrawalId = formData.get('withdrawalId') as string
  const note = formData.get('note') as string | null
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals/${withdrawalId}/reject`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note: note || undefined }),
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to reject withdrawal')
  }
  
  revalidatePath('/dashboard/withdrawals')
}
