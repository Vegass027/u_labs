import OpenAI from 'openai'
import { config, openaiConfig } from '../../config'
import { logger } from '../../utils/logger'
import { AppError } from '../../utils/errors'
import { StructuredBrief } from '@agency/types'
import { BRIEF_SYSTEM_PROMPT, buildBriefUserPrompt } from './brief.prompt'
import { BRIEF_CHAT_SYSTEM_PROMPT } from './brief-chat.prompt'
import { supabase } from '../../db/client'
import { NotFoundError, ForbiddenError } from '../../utils/errors'

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

export async function transcribeAudioOnly(filePath: string): Promise<string> {
  try {
    const fileBuffer = await readFile(filePath)
    const file = new File([fileBuffer], 'audio.wav', { type: 'audio/wav' })

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

export async function processAudioToBrief(filePath: string): Promise<{ transcript: string; brief: StructuredBrief }> {
  const transcript = await transcribeAudio(filePath)
  const brief = await structureBrief(transcript)
  return { transcript, brief }
}

export async function processTextToBrief(rawText: string): Promise<{ brief: StructuredBrief }> {
  const brief = await structureBrief(rawText)
  return { brief }
}

export async function getAiChatHistory(orderId: string, userId: string, userRole: string) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('manager_user_id')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new NotFoundError('Order not found')
  }

  if (order.manager_user_id !== userId && userRole !== 'owner') {
    throw new ForbiddenError('Access denied')
  }

  const { data: messages, error } = await supabase
    .from('ai_chat_messages')
    .select('id, role, content, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) {
    logger.error({ error, orderId }, 'Failed to fetch AI chat history')
    throw new AppError('Failed to fetch chat history', 500)
  }

  return messages || []
}

export async function sendAiChatMessage(
  orderId: string,
  userId: string,
  userRole: string,
  message: string
): Promise<{ response: string; canGenerateBrief: boolean }> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('title, raw_text, manager_user_id')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new NotFoundError('Order not found')
  }

  if (order.manager_user_id !== userId && userRole !== 'owner') {
    throw new ForbiddenError('Access denied')
  }

  const history = await getAiChatHistory(orderId, userId, userRole)

  const systemPrompt = BRIEF_CHAT_SYSTEM_PROMPT.replace(
    '{ORDER_CONTEXT}',
    `Название: ${order.title}. Уже известно: ${order.raw_text || 'ничего'}`
  )

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ],
    })

    const aiResponse = response.choices[0]?.message?.content
    if (!aiResponse) {
      throw new AppError('No response from AI', 500)
    }

    await supabase.from('ai_chat_messages').insert({
      order_id: orderId,
      role: 'user',
      content: message,
    })

    await supabase.from('ai_chat_messages').insert({
      order_id: orderId,
      role: 'assistant',
      content: aiResponse,
    })

    return {
      response: aiResponse,
      canGenerateBrief: aiResponse.includes('Спасибо за информацию. Я собрал достаточно данных. Формирую бриф. Подождите')
    }
  } catch (error: any) {
    logger.error({ error, orderId }, 'AI chat failed')
    
    if (error?.code === 'unsupported_country_region_territory') {
      throw new AppError('OpenAI API недоступен в вашем регионе', 503)
    }
    
    if (error?.type === 'request_forbidden') {
      throw new AppError('OpenAI API недоступен в вашем регионе', 503)
    }
    
    throw new AppError('Failed to get AI response', 500)
  }
}

export async function processDocumentToChat(
  orderId: string,
  userId: string,
  userRole: string,
  fileName: string,
  fileContent: string
): Promise<{ response: string; canGenerateBrief: boolean }> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('title, raw_text, manager_user_id')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new NotFoundError('Order not found')
  }

  if (order.manager_user_id !== userId && userRole !== 'owner') {
    throw new ForbiddenError('Access denied')
  }

  const history = await getAiChatHistory(orderId, userId, userRole)

  // Добавляем содержимое документа в контекст заказа
  const existingContext = order.raw_text || 'ничего'
  const updatedContext = existingContext === 'ничего' 
    ? `Содержимое загруженного документа:\n\n${fileContent}`
    : `${existingContext}\n\nСодержимое загруженного документа:\n\n${fileContent}`

  const systemPrompt = BRIEF_CHAT_SYSTEM_PROMPT.replace(
    '{ORDER_CONTEXT}',
    `Название: ${order.title}. Уже известно: ${updatedContext}`
  )

  logger.info({ fileName, fileContentLength: fileContent.length, fileContentPreview: fileContent.substring(0, 500) }, 'Processing document to chat')

  const userMessage = `Я загрузил документ "${fileName}". Проанализируй его содержимое и задай уточняющие вопросы, если нужно.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
        { role: 'user', content: `Содержимое документа:\n\n${fileContent}` }
      ],
    })

    const aiResponse = response.choices[0]?.message?.content
    if (!aiResponse) {
      throw new AppError('No response from AI', 500)
    }

    await supabase.from('ai_chat_messages').insert({
      order_id: orderId,
      role: 'user',
      content: `📎 Загружен файл: ${fileName}`,
    })

    await supabase.from('ai_chat_messages').insert({
      order_id: orderId,
      role: 'assistant',
      content: aiResponse,
    })

    return {
      response: aiResponse,
      canGenerateBrief: aiResponse.includes('Спасибо за информацию. Я собрал достаточно данных. Формирую бриф. Подождите')
    }
  } catch (error: any) {
    logger.error({ error, orderId, fileName }, 'AI chat with document failed')
    
    if (error?.code === 'unsupported_country_region_territory') {
      throw new AppError('OpenAI API недоступен в вашем регионе', 503)
    }
    
    if (error?.type === 'request_forbidden') {
      throw new AppError('OpenAI API недоступен в вашем регионе', 503)
    }
    
    throw new AppError('Failed to process document', 500)
  }
}
