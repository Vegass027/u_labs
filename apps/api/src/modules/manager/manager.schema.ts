import { z } from 'zod'

export const updatePaymentDetailsSchema = z.object({
  sbp_phone: z.union([
    z.literal(''),
    z.literal(null),
    z.literal('+7'),
    z.string().regex(/^\+7 \d{3} \d{3} \d{2} \d{2}$/),
  ]).optional().transform(val => (val === '' || val === '+7') ? null : val),
  card_number: z.union([
    z.literal(''),
    z.literal(null),
    z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/),
  ]).optional().transform(val => val === '' ? null : val),
  sbp_comment: z.union([
    z.literal(''),
    z.literal(null),
    z.string().max(500),
  ]).optional().transform(val => val === '' ? null : val),
})

export type UpdatePaymentDetailsInput = z.infer<typeof updatePaymentDetailsSchema>
