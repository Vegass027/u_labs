import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../../config'
import { logger } from '../../utils/logger'
import { AppError } from '../../utils/errors'

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey!)

const AVATAR_BUCKET = 'attachments'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

interface UploadAvatarResult {
  url: string
  path: string
}

export async function uploadAvatar(
  userId: string,
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadAvatarResult> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new AppError('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400)
  }

  if (file.length > MAX_FILE_SIZE) {
    throw new AppError('File size exceeds 2MB limit.', 400)
  }

  const fileExt = filename.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      contentType: mimeType,
      upsert: true,
    })

  if (error) {
    logger.error({ userId, error }, 'Failed to upload avatar')
    throw new AppError('Failed to upload avatar', 500)
  }

  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath)

  logger.info({ userId, filePath }, 'Avatar uploaded successfully')

  return {
    url: urlData.publicUrl,
    path: filePath,
  }
}

export async function deleteAvatar(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([filePath])

  if (error) {
    logger.error({ filePath, error }, 'Failed to delete avatar')
    throw new AppError('Failed to delete avatar', 500)
  }

  logger.info({ filePath }, 'Avatar deleted successfully')
}
