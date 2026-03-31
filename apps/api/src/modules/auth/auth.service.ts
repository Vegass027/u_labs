import { supabase, supabaseAdmin } from '../../db/client'
import { logger } from '../../utils/logger'
import { AppError, ConflictError, NotFoundError } from '../../utils/errors'
import type { User, UserRole } from '@agency/types'
import type { RegisterInput } from './auth.schema'

export async function registerUser(input: RegisterInput): Promise<User> {
  const { email, password, role, fullName, phone } = input

  logger.info({ email, role }, 'Registering new user')

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName }, // Сохраняем роль в user_metadata
    }
  })

  if (authError) {
    logger.error({ error: authError }, 'Supabase auth signup failed')
    throw new AppError(authError.message, 400)
  }

  if (!authData.user) {
    throw new AppError('Failed to create user', 500)
  }

  const userId = authData.user.id
  
  // Триггер handle_new_auth_user автоматически создаст запись в public.users
  // Ждём немного чтобы триггер успел сработать
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const { data: userData, error: dbError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (dbError || !userData) {
    logger.error({ error: dbError }, 'Failed to fetch user from public.users after trigger')
    // Если триггер не сработал — удаляем пользователя из auth.users
    await supabaseAdmin.auth.admin.deleteUser(userId)
    throw new AppError('Failed to create user profile', 500)
  }

  // Если передан phone — обновляем
  if (phone) {
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ phone })
      .eq('id', userId)
    
    if (updateError) {
      logger.error({ error: updateError }, 'Failed to update user phone')
    }
  }

  logger.info({ userId, email, role }, 'User registered successfully')

  return userData
}

export async function logoutUser(accessToken: string): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    logger.error({ error }, 'Failed to logout user')
    throw new AppError(error.message, 500)
  }

  logger.info('User logged out successfully')
}

export async function getCurrentUser(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    logger.error({ userId, error }, 'Failed to fetch user')
    throw new NotFoundError('User not found')
  }

  return data
}

export async function updateUserTelegram(userId: string, telegramChatId: string | null): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ telegram_chat_id: telegramChatId })
    .eq('id', userId)
    .select()
    .single()

  if (error || !data) {
    logger.error({ userId, error }, 'Failed to update user telegram_chat_id')
    throw new AppError('Failed to update user', 500)
  }

  logger.info({ userId, telegramChatId }, 'User telegram_chat_id updated')

  return data
}
