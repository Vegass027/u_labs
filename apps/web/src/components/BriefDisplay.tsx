'use client';

import { useState } from 'react';
import { StructuredBrief } from '@agency/types';

interface BriefDisplayProps {
  brief: StructuredBrief | null
  rawText?: string | null
  onEdit?: () => void
}

export function BriefDisplay({ brief, rawText, onEdit }: BriefDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!brief) return;

    const briefText = `
Резюме:
${brief.summary}

Проблема:
${brief.pain || '—'}

Текущий процесс:
${brief.current_process || '—'}

Желаемый результат:
${brief.desired_result || '—'}

Целевая аудитория:
${brief.target_audience || '—'}

Функции:
${brief.features?.map(f => `- ${f}`).join('\n') || '—'}

Интеграции:
${brief.integrations?.map(i => `- ${i}`).join('\n') || '—'}

Бюджет:
${brief.budget || '—'}

Срок:
${brief.deadline || '—'}

Технические подсказки:
${brief.tech_hints || '—'}

Уточняющие вопросы:
${brief.questions?.map(q => `- ${q}`).join('\n') || '—'}
    `.trim();

    await navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Если есть structured_brief (от AI) - отображаем его красиво
  if (brief) {
    return (
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors font-mono text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              редактировать
            </button>
          )}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-muted/10 text-muted-foreground border border-border rounded-lg hover:bg-muted/20 transition-colors font-mono text-sm flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                скопировано
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                копировать
              </>
            )}
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Резюме</h3>
          <p className="text-terminal-prompt font-mono">{brief.summary}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Проблема</h3>
          <p className="text-foreground font-mono">{brief.pain || '—'}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Текущий процесс</h3>
          <p className="text-foreground font-mono">{brief.current_process || '—'}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Желаемый результат</h3>
          <p className="text-foreground font-mono">{brief.desired_result || '—'}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Целевая аудитория</h3>
          <p className="text-foreground font-mono">{brief.target_audience || '—'}</p>
        </div>

        {brief.features && brief.features.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Функции</h3>
            <ul className="list-disc list-inside space-y-1">
              {brief.features.map((feature: string, index: number) => (
                <li key={index} className="text-foreground font-mono">{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {brief.integrations && brief.integrations.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Интеграции</h3>
            <ul className="list-disc list-inside space-y-1">
              {brief.integrations.map((integration: string, index: number) => (
                <li key={index} className="text-foreground font-mono">{integration}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Бюджет</h3>
          <p className="text-foreground font-mono">{brief.budget || '—'}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Срок</h3>
          <p className="text-foreground font-mono">{brief.deadline || '—'}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Технические подсказки</h3>
          <p className="text-foreground font-mono">{brief.tech_hints || '—'}</p>
        </div>

        {brief.questions && brief.questions.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-500 font-mono mb-2">Уточняющие вопросы</h3>
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

  // Если structured_brief нет, но есть raw_text - отображаем как текст
  if (rawText) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-foreground font-mono mb-4">Бриф</h3>
        <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
          {rawText}
        </pre>
      </div>
    )
  }

  // Если нет ни structured_brief, ни raw_text - возвращаем null (родительский компонент решит, что показывать)
  return null
}
