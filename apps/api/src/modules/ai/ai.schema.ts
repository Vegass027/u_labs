import { z } from 'zod'

export const structureTextSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters'),
  order_id: z.string().uuid().optional(),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  orderId: z.string().uuid(),
})

export const transcribeAudioSchema = z.object({
  audio: z.any().refine((val) => val !== undefined, 'Audio file is required'),
})

export const uploadDocumentSchema = z.object({
  file: z.any().refine((val) => val !== undefined, 'File is required'),
})

export type StructureTextInput = z.infer<typeof structureTextSchema>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>
export type TranscribeAudioInput = z.infer<typeof transcribeAudioSchema>
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>
