import { supabase } from '../../db/client'
import { AppError, NotFoundError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import type { IndustryContext } from '@agency/types'
import type { CreateIndustryInput, UpdateIndustryInput } from './industries.schema'

export async function getAllIndustries(): Promise<IndustryContext[]> {
  const { data, error } = await supabase
    .from('industry_contexts')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    logger.error({ error }, 'Failed to fetch industries')
    throw new AppError('Failed to fetch industries', 500)
  }

  return data || []
}

export async function getIndustryById(id: string): Promise<IndustryContext> {
  const { data, error } = await supabase
    .from('industry_contexts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    throw new NotFoundError('Industry not found')
  }

  return data
}

export async function createIndustry(input: CreateIndustryInput): Promise<IndustryContext> {
  const { data, error } = await supabase
    .from('industry_contexts')
    .insert(input)
    .select('*')
    .single()

  if (error) {
    logger.error({ error, input }, 'Failed to create industry')
    throw new AppError('Failed to create industry', 500)
  }

  return data
}

export async function updateIndustry(id: string, input: UpdateIndustryInput): Promise<IndustryContext> {
  const { data, error } = await supabase
    .from('industry_contexts')
    .update(input)
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    logger.error({ error, id, input }, 'Failed to update industry')
    throw new AppError('Failed to update industry', 500)
  }

  return data
}

export async function deleteIndustry(id: string): Promise<void> {
  const { error } = await supabase
    .from('industry_contexts')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    logger.error({ error, id }, 'Failed to delete industry')
    throw new AppError('Failed to delete industry', 500)
  }
}
