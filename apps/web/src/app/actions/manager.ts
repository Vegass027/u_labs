'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface UpdatePaymentDetailsInput {
  sbp_phone?: string | null
  card_number?: string | null
  sbp_comment?: string | null
}

export async function updatePaymentDetails(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const sbpPhone = formData.get('sbp_phone') as string | null
  const cardNumber = formData.get('card_number') as string | null
  const sbpComment = formData.get('sbp_comment') as string | null
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/manager/payment-details`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sbp_phone: sbpPhone || undefined,
        card_number: cardNumber || undefined,
        sbp_comment: sbpComment || undefined,
      }),
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update payment details')
  }
  
  revalidatePath('/manager/balance')
}

export async function updatePaymentDetailsDirect(input: UpdatePaymentDetailsInput) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/manager/payment-details`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sbp_phone: input.sbp_phone || undefined,
        card_number: input.card_number || undefined,
        sbp_comment: input.sbp_comment || undefined,
      }),
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update payment details')
  }
  
  revalidatePath('/manager/balance')
}
