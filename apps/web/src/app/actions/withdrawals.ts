'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWithdrawalRequest(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const amount = Number(formData.get('amount'))
  const note = formData.get('note') as string | null
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/manager/withdrawals`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, note: note || undefined }),
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create withdrawal request')
  }
  
  revalidatePath('/manager/balance')
}
