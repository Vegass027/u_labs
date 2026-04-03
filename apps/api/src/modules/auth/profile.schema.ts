import { z } from 'zod'

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.union([
    z.literal(''),
    z.literal(null),
    z.string().regex(/^\+7 \d{3} \d{3} \d{2} \d{2}$/),
  ]).optional().transform(val => val === '' ? null : val),
  avatar_url: z.union([
    z.literal(null),
    z.string().url(),
  ]).optional(),
})

export const updateNotificationPreferencesSchema = z.object({
  new_orders: z.boolean().optional(),
  status_changes: z.boolean().optional(),
  new_messages: z.boolean().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>
