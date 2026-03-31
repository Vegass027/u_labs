import { z } from 'zod'

export const structureTextSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters'),
  order_id: z.string().uuid().optional(),
})

export type StructureTextInput = z.infer<typeof structureTextSchema>
