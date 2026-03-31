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
  })

  if (authError) {
    logger.error({ error: authError }, 'Supabase auth signup failed')
    throw new AppError(authError.message, 400)
  }

  if (!authData.user) {
    throw new AppError('Failed to create user', 500)
  }

  const userId = authData.user.id

  const { data: userData, error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      email,
      role,
      full_name: fullName,
      phone,
      is_active: true,
    })
    .select()
    .single()

  if (dbError) {
    logger.error({ error: dbError }, 'Failed to insert user into public.users')
    if (supabaseAdmin) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    }
    if (dbError.code === '23505' && dbError.message.includes('users_email_key')) {
      throw new ConflictError('Пользователь с таким email уже существует')
    }
    throw new AppError(dbError.message, 500)
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
