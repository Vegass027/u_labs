import { z } from 'zod'
import type { OrderStatus } from '@agency/types'

export const createOrderSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  raw_text: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

export const createManagerOrderSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  raw_text: z.string().optional(),
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Invalid email address').optional(),
})

export type CreateManagerOrderInput = z.infer<typeof createManagerOrderSchema>

export const updateOrderStatusSchema = z.object({
  status: z.enum(['new', 'reviewing', 'proposal_sent', 'contract_signed', 'in_development', 'done', 'rejected'], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

export const setOrderPriceSchema = z.object({
  price: z.number().positive('Price must be a positive number'),
})

export type SetOrderPriceInput = z.infer<typeof setOrderPriceSchema>

export const listOrdersSchema = z.object({
  status: z.enum(['new', 'reviewing', 'proposal_sent', 'contract_signed', 'in_development', 'done', 'rejected']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type ListOrdersInput = z.infer<typeof listOrdersSchema>

export const updateRawTextSchema = z.object({
  raw_text: z.string(),
})

export type UpdateRawTextInput = z.infer<typeof updateRawTextSchema>
