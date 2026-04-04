import { z } from 'zod'

export const createWithdrawalRequestSchema = z.object({
  amount: z.number().positive('Сумма должна быть положительной'),
  note: z.string().optional(),
})

export type CreateWithdrawalRequestInput = z.infer<typeof createWithdrawalRequestSchema>

export const updateWithdrawalStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    errorMap: () => ({ message: 'Неверный статус' }),
  }),
  note: z.string().optional(),
})

export type UpdateWithdrawalStatusInput = z.infer<typeof updateWithdrawalStatusSchema>
