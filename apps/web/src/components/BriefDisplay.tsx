import { StructuredBrief } from '@agency/types'

interface BriefDisplayProps {
  brief: StructuredBrief | null
}

export function BriefDisplay({ brief }: BriefDisplayProps) {
  if (!brief) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground font-mono">Бриф ещё не сформирован</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Резюме</h3>
        <p className="text-terminal-prompt font-mono">{brief.summary}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Проблема</h3>
        <p className="text-foreground font-mono">{brief.pain || '—'}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Текущий процесс</h3>
        <p className="text-foreground font-mono">{brief.current_process || '—'}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Желаемый результат</h3>
        <p className="text-foreground font-mono">{brief.desired_result || '—'}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Целевая аудитория</h3>
        <p className="text-foreground font-mono">{brief.target_audience || '—'}</p>
      </div>

      {brief.features && brief.features.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Функции</h3>
          <ul className="list-disc list-inside space-y-1">
            {brief.features.map((feature: string, index: number) => (
              <li key={index} className="text-foreground font-mono">{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {brief.integrations && brief.integrations.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Интеграции</h3>
          <ul className="list-disc list-inside space-y-1">
            {brief.integrations.map((integration: string, index: number) => (
              <li key={index} className="text-foreground font-mono">{integration}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Бюджет</h3>
        <p className="text-foreground font-mono">{brief.budget || '—'}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Срок</h3>
        <p className="text-foreground font-mono">{brief.deadline || '—'}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Технические подсказки</h3>
        <p className="text-foreground font-mono">{brief.tech_hints || '—'}</p>
      </div>

      {brief.questions && brief.questions.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground font-mono mb-2">Уточняющие вопросы</h3>
          <ul className="list-disc list-inside space-y-1">
            {brief.questions.map((question: string, index: number) => (
              <li key={index} className="text-foreground font-mono">{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
