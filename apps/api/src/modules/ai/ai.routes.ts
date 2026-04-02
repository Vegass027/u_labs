import { FastifyInstance } from 'fastify'
import { requireAuth } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'
import { structureTextSchema, chatMessageSchema, transcribeAudioSchema } from './ai.schema'
import { structureBrief, processAudioToBrief, getAiChatHistory, sendAiChatMessage, transcribeAudioOnly, processDocumentToChat } from './ai.service'
import { uploadAudio, uploadDocument } from './supabase-storage.service'
import { supabase } from '../../db/client'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import { UserRole } from '@agency/types'
// @ts-ignore
import { writeFile, unlink } from 'fs/promises'
// @ts-ignore
import { randomUUID } from 'crypto'

export async function aiRoutes(fastify: FastifyInstance) {
  fastify.register(require('@fastify/rate-limit'), {
    max: 10,
    timeWindow: '1 minute',
  })

  fastify.post(
    '/api/ai/structure',
    {
      preHandler: [
        requireAuth,
        requireRole('owner', 'manager'),
      ],
    },
    async (req: any, reply: any) => {
      const body = structureTextSchema.parse(req.body)
      const brief = await structureBrief(body.text)

      if (body.order_id) {
        const rawText = `
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
        `.trim()

        const { error } = await supabase
          .from('orders')
          .update({ structured_brief: brief, raw_text: rawText })
          .eq('id', body.order_id)

        if (error) {
          logger.error({ error, orderId: body.order_id }, 'Failed to update order with brief')
          throw new AppError('Failed to update order', 500)
        }
      }

      return reply.send({ brief })
    }
  )

  fastify.post(
    '/api/ai/chat',
    {
      preHandler: [
        requireAuth,
        requireRole('owner', 'manager'),
      ],
    },
    async (req: any, reply: any) => {
      const body = chatMessageSchema.parse(req.body)
      const userId = req.user.id
      const userRole = req.user.role

      const result = await sendAiChatMessage(body.orderId, userId, userRole, body.message)

      return reply.send(result)
    }
  )

  fastify.get(
    '/api/orders/:id/ai-chat',
    {
      preHandler: [
        requireAuth,
        requireRole('owner', 'manager'),
      ],
    },
    async (req: any, reply: any) => {
      const { id: orderId } = req.params as { id: string }
      const userId = req.user.id
      const userRole = req.user.role

      const messages = await getAiChatHistory(orderId, userId, userRole)

      return reply.send(messages)
    }
  )

  fastify.post(
    '/api/manager/orders/:id/audio',
    {
      preHandler: [
        requireAuth,
        requireRole('owner', 'manager'),
      ],
    },
    async (req: any, reply: any) => {
      const orderId = (req.params as { id: string }).id
      const userId = req.user.id

      const data = await req.file({
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      })

      if (!data) {
        throw new AppError('No file uploaded', 400)
      }

      const allowedMimeTypes = ['audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm']
      if (!data.mimetype || !allowedMimeTypes.includes(data.mimetype)) {
        throw new AppError('Invalid file type. Only audio files are allowed.', 400)
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, manager_user_id')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new AppError('Order not found', 404)
      }

      if (order.manager_user_id !== userId && req.user.role !== 'owner') {
        throw new AppError('You do not have permission to process this order', 403)
      }

      const buffer = await data.toBuffer()
      const tempPath = `/tmp/audio_${randomUUID()}.ogg`

      let transcript: string
      let brief: any
      let audioUrl: string

      try {
        await writeFile(tempPath, buffer)

        const storagePath = `orders/${orderId}/audio_${Date.now()}.ogg`
        audioUrl = await uploadAudio(buffer, storagePath)

        const result = await processAudioToBrief(tempPath)
        transcript = result.transcript
        brief = result.brief

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            audio_url: audioUrl,
            transcript,
            structured_brief: brief,
          })
          .eq('id', orderId)

        if (updateError) {
          logger.error({ error: updateError, orderId }, 'Failed to update order with audio data')
          throw new AppError('Failed to update order', 500)
        }

        return reply.send({ transcript, brief })
      } finally {
        try {
          await unlink(tempPath)
        } catch (error) {
          logger.error({ error, tempPath }, 'Failed to delete temp file')
        }
      }
    }
  )

  fastify.post(
    '/api/ai/transcribe',
    {
      preHandler: [
        requireAuth,
        requireRole('owner', 'manager'),
      ],
    },
    async (req: any, reply: any) => {
      logger.info('Starting audio transcribe request')
      
      const data = await req.file({
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      })

      if (!data) {
        logger.error('No file uploaded in transcribe request')
        throw new AppError('No file uploaded', 400)
      }

      logger.info({ mimetype: data.mimetype, filename: data.filename, fieldname: data.fieldname }, 'File received')

      const allowedMimeTypes = ['audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm']
      if (!data.mimetype || !allowedMimeTypes.includes(data.mimetype)) {
        logger.error({ mimetype: data.mimetype }, 'Invalid file type')
        throw new AppError('Invalid file type. Only audio files are allowed.', 400)
      }

      const buffer = await data.toBuffer()
      logger.info({ bufferSize: buffer.length }, 'Audio buffer created')
      
      const tempPath = `/tmp/audio_${randomUUID()}.ogg`

      try {
        await writeFile(tempPath, buffer)
        logger.info({ tempPath }, 'Audio file written to disk')
        
        const transcript = await transcribeAudioOnly(tempPath)
        logger.info({ transcriptLength: transcript.length }, 'Transcription completed')
        
        return reply.send({ transcript })
      } finally {
        try {
          await unlink(tempPath)
          logger.info({ tempPath }, 'Temp file deleted')
        } catch (error) {
          logger.error({ error, tempPath }, 'Failed to delete temp file')
        }
      }
    }
  )

  fastify.post(
    '/api/ai/documents/:id',
    {
      preHandler: [
        requireAuth,
        requireRole('owner', 'manager'),
      ],
    },
    async (req: any, reply: any) => {
      const orderId = (req.params as { id: string }).id
      const userId = req.user.id

      const data = await req.file({
        limits: {
          fileSize: 1 * 1024 * 1024,
        },
      })

      if (!data) {
        throw new AppError('No file uploaded', 400)
      }

      const allowedMimeTypes = ['text/plain', 'text/markdown', 'text/x-markdown']
      if (!data.mimetype || !allowedMimeTypes.includes(data.mimetype)) {
        throw new AppError('Invalid file type. Only .txt and .md files are allowed.', 400)
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, manager_user_id')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new AppError('Order not found', 404)
      }

      if (order.manager_user_id !== userId && req.user.role !== 'owner') {
        throw new AppError('You do not have permission to upload documents for this order', 403)
      }

      const buffer = await data.toBuffer()
      const fileContent = buffer.toString('utf-8')

      // Генерируем уникальное имя файла с расширением
      const ext = data.filename.split('.').pop() || 'txt'
      const storagePath = `orders/${orderId}/${Date.now()}.${ext}`

      try {
        const documentUrl = await uploadDocument(buffer, storagePath, data.mimetype)

        const result = await processDocumentToChat(
          orderId,
          userId,
          req.user.role,
          data.filename,
          fileContent
        )

        return reply.send({
          ...result,
          documentUrl,
          fileName: data.filename,
        })
      } catch (error) {
        logger.error({ error, orderId, fileName: data.filename }, 'Failed to process document')
        throw error
      }
    }
  )
}
