import { supabase } from '../../db/client'
import { NotFoundError, AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import type { UpdatePaymentDetailsInput } from './manager.schema'

export async function getManagerPaymentDetails(managerUserId: string) {
  logger.info({ managerUserId }, 'Getting manager payment details')

  const { data, error } = await supabase
    .from('manager_profiles')
    .select('sbp_phone, card_number, sbp_comment')
    .eq('user_id', managerUserId)
    .single()

  if (error || !data) {
    logger.error({ error, managerUserId }, 'Failed to get manager payment details')
    throw new NotFoundError('Профиль менеджера не найден')
  }

  return {
    sbp_phone: data.sbp_phone,
    card_number: data.card_number,
    sbp_comment: data.sbp_comment,
  }
}

export async function updateManagerPaymentDetails(
  input: UpdatePaymentDetailsInput,
  managerUserId: string
) {
  logger.info({ managerUserId, input }, 'Updating manager payment details')

  // If sbp_phone is null (empty), also clear sbp_comment
  const updateData = {
    sbp_phone: input.sbp_phone,
    card_number: input.card_number,
    sbp_comment: input.sbp_phone === null ? null : input.sbp_comment,
  }

  const { data, error } = await supabase
    .from('manager_profiles')
    .update(updateData)
    .eq('user_id', managerUserId)
    .select('sbp_phone, card_number, sbp_comment')
    .single()

  if (error || !data) {
    logger.error({ error, managerUserId }, 'Failed to update manager payment details')
    throw new AppError('Не удалось обновить реквизиты', 500)
  }

  logger.info({ managerUserId }, 'Manager payment details updated')

  return {
    sbp_phone: data.sbp_phone,
    card_number: data.card_number,
    sbp_comment: data.sbp_comment,
  }
}
