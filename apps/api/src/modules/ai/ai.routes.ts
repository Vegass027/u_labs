import { FastifyInstance } from 'fastify'
import { requireAuth } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'
import { structureTextSchema } from './ai.schema'
import { structureBrief, processAudioToBrief } from './ai.service'
import { uploadAudio } from './supabase-storage.service'
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
        const { error } = await supabase
          .from('orders')
          .update({ structured_brief: brief })
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
}
