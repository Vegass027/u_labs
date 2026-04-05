import { supabase } from '../../db/client'
import { NotFoundError, ForbiddenError, AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import type { CreateWithdrawalRequestInput } from './withdrawals.schema'

export async function createWithdrawalRequest(
  input: CreateWithdrawalRequestInput,
  managerUserId: string
) {
  logger.info({ managerUserId, amount: input.amount }, 'Creating withdrawal request')

  const { data: profile, error: profileError } = await supabase
    .from('manager_profiles')
    .select('id, balance_payable, sbp_phone, card_number')
    .eq('user_id', managerUserId)
    .single()

  if (profileError || !profile) {
    logger.error({ error: profileError, managerUserId }, 'Manager profile not found')
    throw new NotFoundError('Профиль менеджера не найден')
  }

  // Проверяем наличие реквизитов для вывода
  if (!profile.sbp_phone && !profile.card_number) {
    logger.warn({ managerUserId }, 'No payment details for withdrawal')
    throw new AppError('Укажите реквизиты для вывода (СБП или карта)', 400)
  }

  if (input.amount > profile.balance_payable) {
    logger.warn(
      { managerUserId, requested: input.amount, available: profile.balance_payable },
      'Insufficient balance for withdrawal'
    )
    throw new AppError('Недостаточно средств для вывода', 400)
  }

  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert({
      manager_user_id: managerUserId,
      amount: input.amount,
      status: 'pending',
    })
    .select()
    .single()

  if (error || !data) {
    logger.error({ error, managerUserId }, 'Failed to create withdrawal request')
    throw new AppError('Не удалось создать запрос на вывод', 500)
  }

  const { error: balanceError } = await supabase
    .from('manager_profiles')
    .update({
      balance_payable: profile.balance_payable - input.amount,
    })
    .eq('user_id', managerUserId)

  if (balanceError) {
    logger.error({ error: balanceError, managerUserId }, 'Failed to update manager balance')
    throw new AppError('Не удалось обновить баланс менеджера', 500)
  }

  logger.info({ withdrawalId: data.id, amount: input.amount }, 'Withdrawal request created and balance updated')

  return data
}

export async function listManagerWithdrawalRequests(managerUserId: string) {
  logger.info({ managerUserId }, 'Listing manager withdrawal requests')

  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('manager_user_id', managerUserId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error({ error, managerUserId }, 'Failed to list withdrawal requests')
    throw new AppError('Не удалось получить список запросов на вывод', 500)
  }

  return data || []
}

export async function listAllWithdrawalRequests(status?: string) {
  logger.info('Listing all withdrawal requests (owner)', { status })

  let query = supabase
    .from('withdrawal_requests')
    .select(`
      *,
      manager:users!withdrawal_requests_manager_user_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    logger.error({ error }, 'Failed to list all withdrawal requests')
    throw new AppError('Не удалось получить список запросов на вывод', 500)
  }

  if (!data || data.length === 0) return []

  // Получаем реквизиты менеджеров отдельным запросом
  const managerUserIds = [...new Set(data.map(r => r.manager_user_id))]
  
  const { data: profiles } = await supabase
    .from('manager_profiles')
    .select('user_id, sbp_phone, card_number, sbp_comment')
    .in('user_id', managerUserIds)

  const profileMap = Object.fromEntries(
    (profiles || []).map(p => [p.user_id, p])
  )

  const result = data.map(request => ({
    ...request,
    manager_profile: profileMap[request.manager_user_id] || null
  }))

  logger.info({ count: result.length }, 'Withdrawal requests fetched successfully')

  return result
}

export async function approveWithdrawal(withdrawalId: string) {
  logger.info({ withdrawalId }, 'Approving withdrawal request')

  const { data: request, error: fetchError } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .single()

  if (fetchError || !request) {
    logger.error({ error: fetchError, withdrawalId }, 'Withdrawal request not found')
    throw new NotFoundError('Запрос на вывод не найден')
  }

  if (request.status !== 'pending') {
    logger.warn({ withdrawalId, status: request.status }, 'Request already processed')
    throw new AppError('Запрос уже обработан', 400)
  }

  const { data: profile, error: profileError } = await supabase
    .from('manager_profiles')
    .select('balance_paid')
    .eq('user_id', request.manager_user_id)
    .single()

  if (profileError || !profile) {
    logger.error({ error: profileError, managerUserId: request.manager_user_id }, 'Manager profile not found')
    throw new NotFoundError('Профиль менеджера не найден')
  }

  const { error: statusError } = await supabase
    .from('withdrawal_requests')
    .update({
      status: 'approved',
      processed_at: new Date().toISOString(),
    })
    .eq('id', withdrawalId)

  if (statusError) {
    logger.error({ error: statusError, withdrawalId }, 'Failed to approve withdrawal')
    throw new AppError('Не удалось одобрить запрос на вывод', 500)
  }

  const { error: balanceError } = await supabase
    .from('manager_profiles')
    .update({
      balance_paid: profile.balance_paid + request.amount,
    })
    .eq('user_id', request.manager_user_id)

  if (balanceError) {
    logger.error({ error: balanceError, managerUserId: request.manager_user_id }, 'Failed to update manager balance')
    throw new AppError('Не удалось обновить баланс менеджера', 500)
  }

  logger.info({ withdrawalId, amount: request.amount }, 'Withdrawal approved')

  return request
}

export async function rejectWithdrawal(withdrawalId: string, note?: string) {
  logger.info({ withdrawalId, note }, 'Rejecting withdrawal request')

  const { data: request, error: fetchError } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .single()

  if (fetchError || !request) {
    logger.error({ error: fetchError, withdrawalId }, 'Withdrawal request not found')
    throw new NotFoundError('Запрос на вывод не найден')
  }

  const { error } = await supabase
    .from('withdrawal_requests')
    .update({
      status: 'rejected',
      note,
      processed_at: new Date().toISOString(),
    })
    .eq('id', withdrawalId)

  if (error) {
    logger.error({ error, withdrawalId }, 'Failed to reject withdrawal')
    throw new AppError('Не удалось отклонить запрос на вывод', 500)
  }

  const { data: profile, error: profileError } = await supabase
    .from('manager_profiles')
    .select('balance_payable')
    .eq('user_id', request.manager_user_id)
    .single()

  if (profileError || !profile) {
    logger.error({ error: profileError, managerUserId: request.manager_user_id }, 'Manager profile not found')
    throw new NotFoundError('Профиль менеджера не найден')
  }

  const { error: balanceError } = await supabase
    .from('manager_profiles')
    .update({
      balance_payable: profile.balance_payable + request.amount,
    })
    .eq('user_id', request.manager_user_id)

  if (balanceError) {
    logger.error({ error: balanceError, managerUserId: request.manager_user_id }, 'Failed to restore balance')
    throw new AppError('Не удалось восстановить баланс', 500)
  }

  logger.info({ withdrawalId, amount: request.amount }, 'Withdrawal rejected and balance restored')
}

export async function cancelWithdrawal(withdrawalId: string, managerUserId: string) {
  logger.info({ withdrawalId, managerUserId }, 'Cancelling withdrawal request')

  const { data: request, error: fetchError } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .single()

  if (fetchError || !request) {
    logger.error({ error: fetchError, withdrawalId }, 'Withdrawal request not found')
    throw new NotFoundError('Запрос на вывод не найден')
  }

  if (request.manager_user_id !== managerUserId) {
    logger.warn({ withdrawalId, managerUserId }, 'Unauthorized cancellation attempt')
    throw new ForbiddenError('Нет прав для отмены этой заявки')
  }

  if (request.status !== 'pending') {
    logger.warn({ withdrawalId, status: request.status }, 'Cannot cancel non-pending request')
    throw new AppError('Можно отменить только заявку в статусе "в ожидании"', 400)
  }

  const { data: profile, error: profileError } = await supabase
    .from('manager_profiles')
    .select('balance_payable')
    .eq('user_id', request.manager_user_id)
    .single()

  if (profileError || !profile) {
    logger.error({ error: profileError, managerUserId: request.manager_user_id }, 'Manager profile not found')
    throw new NotFoundError('Профиль менеджера не найден')
  }

  const { error } = await supabase
    .from('withdrawal_requests')
    .update({
      status: 'rejected',
      note: 'Отменено менеджером',
      processed_at: new Date().toISOString(),
    })
    .eq('id', withdrawalId)

  if (error) {
    logger.error({ error, withdrawalId }, 'Failed to cancel withdrawal')
    throw new AppError('Не удалось отменить заявку на вывод', 500)
  }

  const { error: balanceError } = await supabase
    .from('manager_profiles')
    .update({
      balance_payable: profile.balance_payable + request.amount,
    })
    .eq('user_id', request.manager_user_id)

  if (balanceError) {
    logger.error({ error: balanceError, managerUserId: request.manager_user_id }, 'Failed to restore balance')
    throw new AppError('Не удалось восстановить баланс', 500)
  }

  logger.info({ withdrawalId, amount: request.amount }, 'Withdrawal cancelled and balance restored')

  return request
}
