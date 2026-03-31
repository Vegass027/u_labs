import { z } from 'zod'
import type { UserRole } from '@agency/types'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['manager', 'client'], {
    errorMap: () => ({ message: 'Role must be either manager or client' }),
  }),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
