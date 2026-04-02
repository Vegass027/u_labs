import { createClient } from '@supabase/supabase-js'
import { config, supabaseConfig } from '../../config'
import { logger } from '../../utils/logger'
import { AppError } from '../../utils/errors'

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey!)

// @ts-ignore
export async function uploadAudio(fileBuffer: Buffer, path: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('audio-uploads')
      .upload(path, fileBuffer, {
        contentType: 'audio/ogg',
        upsert: false,
      })

    if (error) {
      logger.error({ error, path }, 'Failed to upload audio to Supabase Storage')
      throw new AppError('Failed to upload audio', 500)
    }

    const { data: publicUrlData } = supabase.storage
      .from('audio-uploads')
      .getPublicUrl(data.path)

    return publicUrlData.publicUrl
  } catch (error) {
    logger.error({ error, path }, 'Audio upload failed')
    throw new AppError('Failed to upload audio', 500)
  }
}

export async function uploadDocument(fileBuffer: Buffer, path: string, mimeType: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) {
      logger.error({ error, path }, 'Failed to upload document to Supabase Storage')
      throw new AppError('Failed to upload document', 500)
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path)

    return publicUrlData.publicUrl
  } catch (error) {
    logger.error({ error, path }, 'Document upload failed')
    throw new AppError('Failed to upload document', 500)
  }
}
