'use client';

import { useMemo } from 'react';
import { StructuredBrief } from '@agency/types';
import { RawTextEditor } from '@/components/RawTextEditor';

interface BriefSectionProps {
  orderId: string;
  brief: StructuredBrief | null;
  rawText: string | null;
}

export function BriefSection({ orderId, brief, rawText }: BriefSectionProps) {
  // Конвертируем AI-бриф в текст для редактирования
  const briefAsText = useMemo(() => {
    if (!brief) return null;

    return `
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
  }, [brief]);

  // Приоритет raw_text над briefAsText
  return <RawTextEditor orderId={orderId} initialText={rawText || briefAsText} />;
}
