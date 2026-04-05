'use server'

import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateRawText(orderId: string, rawText: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ raw_text: rawText })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Инвалидируем кэш по тегу заказа
  revalidateTag(`order-${orderId}`)

  return { data }
}
