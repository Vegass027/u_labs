import { z } from 'zod'

export const createIndustrySchema = z.object({
  name: z.string().min(2).max(200),
  keywords: z.array(z.string().min(1)).min(1).max(50),
  pains: z.string().max(5000).optional().default(''),
  roles: z.string().max(5000).optional().default(''),
  processes: z.string().max(5000).optional().default(''),
  integrations: z.string().max(5000).optional().default(''),
  metrics: z.string().max(5000).optional().default(''),
  first_release: z.string().max(5000).optional().default(''),
  misconceptions: z.string().max(5000).optional().default(''),
  is_active: z.boolean().default(true),
})

export const updateIndustrySchema = z.object({
  name: z.string().min(2).max(200).optional(),
  keywords: z.array(z.string().min(1)).min(1).max(50).optional(),
  pains: z.string().max(5000).optional(),
  roles: z.string().max(5000).optional(),
  processes: z.string().max(5000).optional(),
  integrations: z.string().max(5000).optional(),
  metrics: z.string().max(5000).optional(),
  first_release: z.string().max(5000).optional(),
  misconceptions: z.string().max(5000).optional(),
  is_active: z.boolean().optional(),
})

export type CreateIndustryInput = z.infer<typeof createIndustrySchema>
export type UpdateIndustryInput = z.infer<typeof updateIndustrySchema>
