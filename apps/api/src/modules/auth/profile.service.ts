import { supabase } from '../../db/client'
import { logger } from '../../utils/logger'
import { AppError } from '../../utils/errors'
import type { User } from '@agency/types'
import type { UpdateProfileInput, UpdateNotificationPreferencesInput } from './profile.schema'

export async function updateUserProfile(userId: string, profileData: UpdateProfileInput): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({
      full_name: profileData.full_name,
      phone: profileData.phone || null,
      avatar_url: profileData.avatar_url,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error || !data) {
    logger.error({ userId, error }, 'Failed to update user profile')
    throw new AppError('Failed to update profile', 500)
  }

  logger.info({ userId }, 'User profile updated')

  return data
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: UpdateNotificationPreferencesInput
): Promise<User> {
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('notification_preferences')
    .eq('id', userId)
    .single()

  if (fetchError || !userData) {
    logger.error({ userId, error: fetchError }, 'Failed to fetch user notification preferences')
    throw new AppError('Failed to update notification preferences', 500)
  }

  const currentPreferences = userData.notification_preferences || {}
  const updatedPreferences = { ...currentPreferences, ...preferences }

  const { data, error } = await supabase
    .from('users')
    .update({ notification_preferences: updatedPreferences })
    .eq('id', userId)
    .select()
    .single()

  if (error || !data) {
    logger.error({ userId, error }, 'Failed to update notification preferences')
    throw new AppError('Failed to update notification preferences', 500)
  }

  logger.info({ userId, preferences: updatedPreferences }, 'Notification preferences updated')

  return data
}
