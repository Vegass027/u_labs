import { StructuredBrief } from '@agency/types'

interface BriefDisplayProps {
  brief: StructuredBrief | null
}

export function BriefDisplay({ brief }: BriefDisplayProps) {
  if (!brief) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-500">Бриф ещё не сформирован</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Резюме</h3>
        <p className="text-blue-800">{brief.summary}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Проблема</h3>
        <p className="text-gray-700">{brief.pain || '—'}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Текущий процесс</h3>
        <p className="text-gray-700">{brief.current_process || '—'}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Желаемый результат</h3>
        <p className="text-gray-700">{brief.desired_result || '—'}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Целевая аудитория</h3>
        <p className="text-gray-700">{brief.target_audience || '—'}</p>
      </div>

      {brief.features && brief.features.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Функции</h3>
          <ul className="list-disc list-inside space-y-1">
            {brief.features.map((feature: string, index: number) => (
              <li key={index} className="text-gray-700">{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {brief.integrations && brief.integrations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Интеграции</h3>
          <ul className="list-disc list-inside space-y-1">
            {brief.integrations.map((integration: string, index: number) => (
              <li key={index} className="text-gray-700">{integration}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Бюджет</h3>
        <p className="text-gray-700">{brief.budget || '—'}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Срок</h3>
        <p className="text-gray-700">{brief.deadline || '—'}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Технические подсказки</h3>
        <p className="text-gray-700">{brief.tech_hints || '—'}</p>
      </div>

      {brief.questions && brief.questions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Уточняющие вопросы</h3>
          <ul className="list-disc list-inside space-y-1">
            {brief.questions.map((question: string, index: number) => (
              <li key={index} className="text-amber-800">{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
