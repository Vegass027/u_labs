import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { IndustryForm } from '../components/IndustryForm'
import { IndustryTitleSaver } from './IndustryTitleSaver'
import type { IndustryContext } from '@agency/types'

export default async function IndustryEditPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: industry, error } = await supabase
    .from('industry_contexts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !industry) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
          <div className="text-sm font-mono text-red-400">
            <span className="font-bold">[error]</span> {error?.message || 'Не удалось загрузить нишу'}
          </div>
        </div>
      </div>
    )
  }

  const industryContext: IndustryContext = {
    id: industry.id,
    name: industry.name,
    keywords: industry.keywords,
    pains: industry.pains,
    roles: industry.roles,
    processes: industry.processes,
    integrations: industry.integrations,
    metrics: industry.metrics,
    first_release: industry.first_release,
    misconceptions: industry.misconceptions,
    is_active: industry.is_active,
    created_at: industry.created_at,
    updated_at: industry.updated_at,
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Save industry title to localStorage for tabs */}
      <IndustryTitleSaver industryId={industry.id} title={industry.name} />

      {/* // ============================================================
          // HEADER SECTION
          // ============================================================ */}
      <div className="mb-6">
        <Link
          href="/dashboard/industries"
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="text-[#dcb67a]">{'<<<'}</span>
          <span className="text-[#dcb67a]">𖣔</span>
          <span>К нишам</span>
        </Link>
      </div>

      {/* // ============================================================
          // FORM SECTION
          // ============================================================ */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 bg-muted/50">
          <h1 className="text-lg font-bold text-foreground font-mono">
            <span className="text-[#dcb67a]">{'>>>'}</span> Редактировать нишу: <span className="text-[#dcb67a]">{industry.name}</span>
          </h1>
        </div>
        <div className="p-4">
          <IndustryForm industry={industryContext} />
        </div>
      </div>
    </div>
  )
}
