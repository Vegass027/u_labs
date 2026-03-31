import OpenAI from 'openai'
import { config, openaiConfig } from '../../config'
import { logger } from '../../utils/logger'
import { AppError } from '../../utils/errors'
import { StructuredBrief } from '@agency/types'
import { BRIEF_SYSTEM_PROMPT, buildBriefUserPrompt } from './brief.prompt'

// @ts-ignore
import { readFile } from 'fs/promises'

const openai = new OpenAI({
  apiKey: openaiConfig.apiKey,
})

export async function transcribeAudio(filePath: string): Promise<string> {
  try {
    const fileBuffer = await readFile(filePath)
    const file = new File([fileBuffer], 'audio.wav', { type: 'audio/wav' })

    // @ts-ignore
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'ru',
      response_format: 'text',
    })

    return transcription
  } catch (error) {
    logger.error({ error }, 'Audio transcription failed')
    throw new AppError('Failed to transcribe audio', 500)
  }
}

export async function structureBrief(rawText: string): Promise<StructuredBrief> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: BRIEF_SYSTEM_PROMPT },
        { role: 'user', content: buildBriefUserPrompt(rawText) },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new AppError('No content returned from GPT', 500)
    }

    const brief = JSON.parse(content) as StructuredBrief

    return brief
  } catch (error) {
    logger.error({ error }, 'Brief structuring failed')
    if (error instanceof SyntaxError) {
      throw new AppError('Brief structuring failed: invalid JSON', 422)
    }
    throw new AppError('Brief structuring failed', 500)
  }
}

export async function processAudioToBrief(filePath: string): Promise<{ transcript: string; brief: StructuredBrief }> {
  const transcript = await transcribeAudio(filePath)
  const brief = await structureBrief(transcript)
  return { transcript, brief }
}

export async function processTextToBrief(rawText: string): Promise<{ brief: StructuredBrief }> {
  const brief = await structureBrief(rawText)
  return { brief }
}
