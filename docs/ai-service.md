ai.service.ts — три сценария: только транскрипция, только структуризация текста, и комбо аудио→транскрипт→бриф за один вызов. temperature: 0.2 — намеренно низкая, чтобы GPT не фантазировал, а извлекал только то что сказал клиент.



_______________________________________________________________


import OpenAI from 'openai'
import { BRIEF_SYSTEM_PROMPT, buildBriefUserPrompt } from './brief.prompt'
import fs from 'fs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ─── Типы ───────────────────────────────────────────────────

export interface StructuredBrief {
  pain:             string | null
  current_process:  string | null
  desired_result:   string | null
  target_audience:  string | null
  features:         string[] | null
  integrations:     string[] | null
  budget:           string | null
  deadline:         string | null
  tech_hints:       string | null
  questions:        string[] | null
  summary:          string
}

// ─── Whisper: аудио → текст ─────────────────────────────────

export async function transcribeAudio(audioFilePath: string): Promise<string> {
  const fileStream = fs.createReadStream(audioFilePath)

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: fileStream,
    language: 'ru',
    response_format: 'text',
  })

  return response.trim()
}

// ─── GPT-4o: текст → структурированный бриф ─────────────────

export async function structureBrief(rawText: string): Promise<StructuredBrief> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: BRIEF_SYSTEM_PROMPT },
      { role: 'user',   content: buildBriefUserPrompt(rawText) },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('GPT вернул пустой ответ')

  const brief = JSON.parse(content) as StructuredBrief
  return brief
}

// ─── Комбо: аудио → транскрипт → бриф ──────────────────────

export async function processAudioToBrief(audioFilePath: string): Promise<{
  transcript: string
  brief: StructuredBrief
}> {
  const transcript = await transcribeAudio(audioFilePath)
  const brief      = await structureBrief(transcript)
  return { transcript, brief }
}

// ─── Комбо: текст → бриф (если менеджер пишет текстом) ─────

export async function processTextToBrief(rawText: string): Promise<{
  brief: StructuredBrief
}> {
  const brief = await structureBrief(rawText)
  return { brief }
}


_______________________________________________________________