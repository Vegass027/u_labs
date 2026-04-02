import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../../config'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey!)

export interface Document {
  name: string
  id: string
  size: number
  created_at: string
  updated_at: string
  publicUrl: string
}

export async function listOrderDocuments(orderId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .list(`orders/${orderId}/`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (error) {
      logger.error({ error, orderId }, 'Failed to list documents')
      throw new AppError('Failed to list documents', 500)
    }

    if (!data) {
      return []
    }

    const documents: Document[] = data.map((file: any) => {
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(file.name)

      return {
        name: file.name.replace(`orders/${orderId}/`, ''),
        id: file.id,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at,
        publicUrl: publicUrlData.publicUrl,
      }
    })

    return documents
  } catch (error) {
    logger.error({ error, orderId }, 'Failed to list documents')
    throw new AppError('Failed to list documents', 500)
  }
}

export async function uploadOrderDocument(
  orderId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ url: string; document: Document }> {
  try {
    const ext = fileName.split('.').pop() || 'txt'
    const storagePath = `orders/${orderId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) {
      logger.error({ error, orderId, fileName }, 'Failed to upload document')
      throw new AppError('Failed to upload document', 500)
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path)

    const document: Document = {
      name: fileName,
      id: data.id,
      size: fileBuffer.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      publicUrl: publicUrlData.publicUrl,
    }

    return { url: publicUrlData.publicUrl, document }
  } catch (error) {
    logger.error({ error, orderId, fileName }, 'Failed to upload document')
    throw new AppError('Failed to upload document', 500)
  }
}
