'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiServer } from '@/lib/api-server'
import type { IndustryContext } from '@agency/types'

export async function createIndustry(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    keywords: (formData.get('keywords') as string).split(',').map(k => k.trim()).filter(k => k),
    pains: formData.get('pains') as string,
    roles: formData.get('roles') as string,
    processes: formData.get('processes') as string,
    integrations: formData.get('integrations') as string,
    metrics: formData.get('metrics') as string,
    first_release: formData.get('first_release') as string,
    misconceptions: formData.get('misconceptions') as string,
  }

  const { error } = await apiServer.post('/api/admin/industries', data)
  if (error) throw new Error(error)

  revalidatePath('/dashboard/industries')
}

export async function updateIndustry(id: string, formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    keywords: (formData.get('keywords') as string).split(',').map(k => k.trim()).filter(k => k),
    pains: formData.get('pains') as string,
    roles: formData.get('roles') as string,
    processes: formData.get('processes') as string,
    integrations: formData.get('integrations') as string,
    metrics: formData.get('metrics') as string,
    first_release: formData.get('first_release') as string,
    misconceptions: formData.get('misconceptions') as string,
  }

  const { error } = await apiServer.patch(`/api/admin/industries/${id}`, data)
  if (error) throw new Error(error)

  revalidatePath('/dashboard/industries')
}

export async function deleteIndustry(formData: FormData) {
  const id = formData.get('id') as string

  const { error } = await apiServer.delete(`/api/admin/industries/${id}`)
  if (error) throw new Error(error)

  revalidatePath('/dashboard/industries')
}

export async function createIndustryWithRedirect(formData: FormData) {
  await createIndustry(formData)
  redirect('/dashboard/industries')
}

export async function updateIndustryWithRedirect(id: string, formData: FormData) {
  await updateIndustry(id, formData)
  redirect('/dashboard/industries')
}
