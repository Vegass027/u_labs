import { supabase } from '../../db/client'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import type { CreateDeveloperApplicationInput } from './dev-applications.schema'

export async function submitDeveloperApplication(input: CreateDeveloperApplicationInput) {
  logger.info({ input: { ...input, phone: '[REDACTED]' } }, 'Submitting developer application')

  const { data, error } = await supabase
    .from('developer_applications')
    .insert(input)
    .select('id')
    .single()

  if (error) {
    logger.error({ error }, 'Failed to submit developer application')
    throw new AppError('Не удалось отправить заявку', 500)
  }

  logger.info({ applicationId: data.id }, 'Developer application submitted')

  return { id: data.id }
}
