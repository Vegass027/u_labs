import { z } from 'zod'

export const createDeveloperApplicationSchema = z.object({
  full_name: z.string().min(2, 'Имя обязательно').max(100),
  phone: z.string().min(7, 'Телефон обязателен').max(20),
  experience_years: z.number({ required_error: 'Укажите опыт работы' }).int().min(0).max(50),
  experience_months: z.number().int().min(0).max(11).default(0),
  telegram: z.string().max(100).optional(),
  about: z.string().max(2000).optional(),
})

export type CreateDeveloperApplicationInput = z.infer<typeof createDeveloperApplicationSchema>
