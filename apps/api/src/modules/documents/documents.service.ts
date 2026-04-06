import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../../config'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey!)

const SIGNED_URL_EXPIRES_IN = 60 * 60 * 24 * 7 // 7 дней

function transliterate(str: string): string {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  }
  return str.split('').map(c => map[c] ?? c).join('')
}

export interface Document {
  name: string
  path: string
  id: string
  size: number
  created_at: string | null
  updated_at: string | null
  publicUrl: string
  uploaded_by?: string | null
}

export async function listOrderDocuments(orderId: string): Promise<Document[]> {
  try {
    const { data: dbDocs, error } = await supabase
      .from('order_documents')
      .select('id, order_id, storage_path, original_name, size, mime_type, uploaded_by, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error({ error, orderId }, 'Failed to list documents')
      throw new AppError('Failed to list documents', 500)
    }

    if (!dbDocs || dbDocs.length === 0) return []

    const documents: Document[] = await Promise.all(
      dbDocs.map(async (doc) => {
        const { data: signedData, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(doc.storage_path, SIGNED_URL_EXPIRES_IN, {
            download: doc.original_name
          })

        if (signedError) {
          logger.error({ signedError, storagePath: doc.storage_path }, 'Failed to create signed URL')
          throw new AppError('Failed to create signed URL', 500)
        }

        return {
          name: doc.original_name,
          path: doc.storage_path,
          id: doc.id,
          size: doc.size,
          created_at: doc.created_at,
          updated_at: doc.created_at,
          publicUrl: signedData.signedUrl,
          uploaded_by: doc.uploaded_by,
        }
      })
    )

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
  mimeType: string,
  userId: string
): Promise<{ url: string; document: Document }> {
  try {
    const transliterated = transliterate(fileName)
    const safeName = transliterated.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `orders/${orderId}/${Date.now()}__${safeName}`

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

    const { data: dbDoc, error: dbError } = await supabase
      .from('order_documents')
      .insert({
        order_id: orderId,
        storage_path: data.path,
        original_name: fileName,
        size: fileBuffer.length,
        mime_type: mimeType,
        uploaded_by: userId,
      })
      .select()
      .single()

    if (dbError) {
      logger.error({ dbError, orderId, fileName }, 'Failed to save document to DB')
      await supabase.storage.from('documents').remove([data.path])
      throw new AppError('Failed to save document', 500)
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from('documents')
      .createSignedUrl(data.path, SIGNED_URL_EXPIRES_IN, {
        download: fileName
      })

    if (signedError) {
      logger.error({ signedError, path: data.path }, 'Failed to create signed URL')
      throw new AppError('Failed to create signed URL', 500)
    }

    const document: Document = {
      name: fileName,
      path: data.path,
      id: dbDoc.id,
      size: fileBuffer.length,
      created_at: dbDoc.created_at,
      updated_at: dbDoc.created_at,
      publicUrl: signedData.signedUrl,
      uploaded_by: dbDoc.uploaded_by,
    }

    return { url: signedData.signedUrl, document }
  } catch (error) {
    logger.error({ error, orderId, fileName }, 'Failed to upload document')
    throw new AppError('Failed to upload document', 500)
  }
}

export async function deleteOrderDocument(orderId: string, storagePath: string): Promise<void> {
  try {
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([storagePath])

    if (storageError) {
      logger.error({ storageError, storagePath }, 'Failed to delete from storage')
      throw new AppError('Failed to delete document', 500)
    }

    const { error: dbError } = await supabase
      .from('order_documents')
      .delete()
      .eq('storage_path', storagePath)

    if (dbError) {
      logger.error({ dbError, storagePath }, 'Failed to delete document from DB')
      throw new AppError('Failed to delete document record', 500)
    }
  } catch (error) {
    logger.error({ error, storagePath }, 'Failed to delete document')
    throw new AppError('Failed to delete document', 500)
  }
}
