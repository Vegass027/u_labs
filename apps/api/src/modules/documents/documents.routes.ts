import { FastifyInstance } from 'fastify'
import { requireAuth } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'
import { listDocumentsSchema, uploadDocumentSchema } from './documents.schema'
import { listOrderDocuments, uploadOrderDocument, deleteOrderDocument } from './documents.service'
import { supabase } from '../../db/client'
import { AppError } from '../../utils/errors'
import { UserRole } from '@agency/types'

export async function documentsRoutes(fastify: FastifyInstance) {
  fastify.register(require('@fastify/rate-limit'), {
    max: 20,
    timeWindow: '1 minute',
  })

  fastify.get(
    '/api/orders/:id/documents',
    {
      preHandler: [requireAuth, requireRole('owner', 'manager')],
    },
    async (req: any, reply: any) => {
      const { id: orderId } = req.params as { id: string }
      const userId = req.user.id
      const userRole = req.user.role

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, manager_user_id')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new AppError('Order not found', 404)
      }

      if (order.manager_user_id !== userId && userRole !== 'owner') {
        throw new AppError('Access denied', 403)
      }

      const documents = await listOrderDocuments(orderId)
      return reply.send(documents)
    }
  )

  fastify.post(
    '/api/orders/:id/documents',
    {
      preHandler: [requireAuth, requireRole('owner', 'manager')],
    },
    async (req: any, reply: any) => {
      const { id: orderId } = req.params as { id: string }
      const userId = req.user.id
      const userRole = req.user.role

      const data = await req.file({
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      })

      if (!data) {
        throw new AppError('No file uploaded', 400)
      }

      const allowedMimeTypes = [
        'text/plain',
        'text/markdown',
        'text/x-markdown',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]

      if (!data.mimetype || !allowedMimeTypes.includes(data.mimetype)) {
        throw new AppError('Invalid file type. Only .txt, .md, .pdf, .doc, .docx, .xls, .xlsx files are allowed.', 400)
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, manager_user_id')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new AppError('Order not found', 404)
      }

      if (order.manager_user_id !== userId && userRole !== 'owner') {
        throw new AppError('Access denied', 403)
      }

      const buffer = await data.toBuffer()
      const result = await uploadOrderDocument(
        orderId,
        buffer,
        data.filename,
        data.mimetype
      )

      return reply.send(result)
    }
  )

  fastify.delete(
    '/api/orders/:id/documents/:filepath',
    {
      preHandler: [requireAuth, requireRole('owner', 'manager')],
    },
    async (req: any, reply: any) => {
      const { id: orderId, filepath } = req.params as { id: string; filepath: string }
      const userId = req.user.id
      const userRole = req.user.role

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, manager_user_id')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new AppError('Order not found', 404)
      }

      if (order.manager_user_id !== userId && userRole !== 'owner') {
        throw new AppError('Access denied', 403)
      }

      await deleteOrderDocument(orderId, decodeURIComponent(filepath))
      return reply.send({ success: true })
    }
  )
}
