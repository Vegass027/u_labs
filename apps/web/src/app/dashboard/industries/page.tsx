import { createClient } from '@/lib/supabase/server'
import type { IndustryContext } from '@agency/types'
import Link from 'next/link'

// ============================================================================
// INDUSTRIES PAGE
// ============================================================================
// Отображает все ниши в виде кода с подсветкой синтаксиса
// ============================================================================

function getIndustryStatusColor(isActive: boolean): string {
  return isActive ? 'text-green-400' : 'text-red-400'
}

function getIndustryStatusText(isActive: boolean): string {
  return isActive ? 'активна' : 'неактивна'
}

export default async function IndustriesPage() {
  const supabase = await createClient()

  const { data: industries, error } = await supabase
    .from('industry_contexts')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch industries:', error)
    return []
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* // ============================================================
          // HEADER SECTION
          // ============================================================ */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg text-foreground font-mono">
          <span className="font-bold">// Все ниши // -&gt;</span> <span className="text-[#dcb67a]">Все ниши в системе:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-foreground">
            // добавить нишу
          </span>
          <Link
            href="/dashboard/industries/new"
            className="inline-block px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-terminal-prompt hover:text-glow-sm text-sm font-mono"
          >
            ~/add-industries
          </Link>
        </div>
      </div>

      {/* // ============================================================
          // INDUSTRIES LIST - CODE STYLE WITH FIXED COLUMNS
          // ============================================================ */}
      <div className="font-mono text-sm">
        {industries && industries.length === 0 ? (
          <div className="text-muted-foreground text-xs">
            <div className="text-terminal-comment mb-2">// ниш пока нет</div>
            <div>// создайте первую нишу для начала работы</div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {industries?.map((industry) => (
              <Link
                key={industry.id}
                href={`/dashboard/industries/${industry.id}`}
                className="block"
              >
                <div className="flex items-center hover:bg-muted/50 transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(74,222,128,0.3),0_-4px_20px_-4px_rgba(74,222,128,0.3)] rounded px-3 py-4 group cursor-pointer">
                  {/* Code content with fixed columns */}
                  <div className="flex-1 flex items-center gap-4">
                    {/* Arrow indicator */}
                    <span className="text-[#dcb67a] text-xs shrink-0">
                      {'>>>'}
                    </span>

                    {/* Industry name - fixed width */}
                    <span className="text-primary font-medium w-56 shrink-0 truncate">
                      {industry.name}
                    </span>

                    {/* Status - fixed width */}
                    <span className={`${getIndustryStatusColor(industry.is_active)} w-36 shrink-0 flex items-center gap-2 whitespace-nowrap`}>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getIndustryStatusColor(industry.is_active).replace('text-', 'bg-')}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${getIndustryStatusColor(industry.is_active).replace('text-', 'bg-')}`}></span>
                      </span>
                      {getIndustryStatusText(industry.is_active)}
                    </span>

                    {/* Extra gap between status and keywords */}
                    <span className="w-8 shrink-0"></span>

                    {/* Keywords - fixed width */}
                    <span className="text-muted-foreground w-44 shrink-0 truncate">
                      {'〖' + industry.keywords.slice(0, 3).join(', ') + (industry.keywords.length > 3 ? ` +${industry.keywords.length - 3}` : '') + '〗'}
                    </span>

                    {/* Date - fixed width */}
                    <span className="text-muted-foreground/60 text-xs w-36 shrink-0">
                      {'[' + new Date(industry.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ']'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
