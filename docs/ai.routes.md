ai.routes.ts — три эндпоинта. Эндпоинт /manager/orders/:id/audio — самый умный: принимает файл, сохраняет в S3, транскрибирует, структурирует и всё записывает в заказ одним запросом.


_________________________________________________________________


import { FastifyInstance } from 'fastify'
import { transcribeAudio, structureBrief, processAudioToBrief } from './ai.service'
import { saveUploadedFile, deleteFile } from '../storage/s3.service'
import { requireRole } from '../middleware/role.middleware'
import db from '../db/client'

export async function aiRoutes(app: FastifyInstance) {

  // ── POST /api/ai/transcribe ─────────────────────────────
  // Загрузить аудио → получить транскрипт
  app.post('/api/ai/transcribe', {
    preHandler: [requireRole(['owner', 'manager'])],
  }, async (req, reply) => {
    const data = await req.file()
    if (!data) return reply.status(400).send({ error: 'Файл не найден' })

    const allowedTypes = ['audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm']
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Неподдерживаемый формат аудио' })
    }

    // Сохраняем временно на диск
    const tmpPath = `/tmp/audio_${Date.now()}_${data.filename}`
    await data.toFile(tmpPath)

    try {
      const transcript = await transcribeAudio(tmpPath)
      return reply.send({ transcript })
    } finally {
      await deleteFile(tmpPath)
    }
  })

  // ── POST /api/ai/structure ──────────────────────────────
  // Текст → структурированный бриф
  app.post('/api/ai/structure', {
    preHandler: [requireRole(['owner', 'manager'])],
    schema: {
      body: {
        type: 'object',
        required: ['text'],
        properties: {
          text:     { type: 'string', minLength: 10 },
          order_id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (req, reply) => {
    const { text, order_id } = req.body as { text: string; order_id?: string }

    const brief = await structureBrief(text)

    // Если передан order_id — сразу сохраняем в заказ
    if (order_id) {
      await db.query(
        `UPDATE orders 
         SET structured_brief = $1, updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(brief), order_id]
      )
    }

    return reply.send({ brief })
  })

  // ── POST /api/manager/orders/:id/audio ─────────────────
  // Менеджер загружает голосовое → транскрипт + бриф автоматом
  app.post('/api/manager/orders/:id/audio', {
    preHandler: [requireRole(['manager'])],
  }, async (req, reply) => {
    const { id: orderId } = req.params as { id: string }

    // Проверяем что заказ принадлежит менеджеру
    const { rows } = await db.query(
      `SELECT id FROM orders WHERE id = $1 AND manager_user_id = $2`,
      [orderId, req.user.id]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Заказ не найден' })

    const data = await req.file()
    if (!data) return reply.status(400).send({ error: 'Файл не найден' })

    // Сохраняем аудио в S3
    const audioUrl = await saveUploadedFile(data, `orders/${orderId}/audio`)

    const tmpPath = `/tmp/audio_${Date.now()}`
    await data.toFile(tmpPath)

    try {
      const { transcript, brief } = await processAudioToBrief(tmpPath)

      // Обновляем заказ
      await db.query(
        `UPDATE orders 
         SET audio_url        = $1,
             transcript       = $2,
             structured_brief = $3,
             updated_at       = NOW()
         WHERE id = $4`,
        [audioUrl, transcript, JSON.stringify(brief), orderId]
      )

      return reply.send({ transcript, brief })
    } finally {
      await deleteFile(tmpPath)
    }
  })
}


________________________________________________________________