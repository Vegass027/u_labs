import { z } from 'zod'

export const listDocumentsSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
})

export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>

export const uploadDocumentSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
})

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>
