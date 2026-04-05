import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
  createWithdrawalRequest,
  listManagerWithdrawalRequests,
  listAllWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal,
  cancelWithdrawal,
} from './withdrawals.service'
import {
  createWithdrawalRequestSchema,
  updateWithdrawalStatusSchema,
} from './withdrawals.schema'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import { requireAuth } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'

export async function withdrawalsRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/manager/withdrawals',
    { preHandler: [requireAuth, requireRole('manager')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const validatedInput = createWithdrawalRequestSchema.parse(req.body)
        const withdrawal = await createWithdrawalRequest(validatedInput, req.user.id)
        return reply.status(201).send(withdrawal)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in POST /api/manager/withdrawals')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get(
    '/api/manager/withdrawals',
    { preHandler: [requireAuth, requireRole('manager')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const withdrawals = await listManagerWithdrawalRequests(req.user.id)
        return reply.send(withdrawals)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in GET /api/manager/withdrawals')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.delete(
    '/api/manager/withdrawals/:id',
    { preHandler: [requireAuth, requireRole('manager')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        await cancelWithdrawal(id, req.user.id)
        return reply.send({ success: true })
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in DELETE /api/manager/withdrawals/:id')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get(
    '/api/admin/withdrawals',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const { status } = req.query as { status?: string }
        const withdrawals = await listAllWithdrawalRequests(status)
        return reply.send(withdrawals)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in GET /api/admin/withdrawals')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.patch(
    '/api/admin/withdrawals/:id/approve',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        const withdrawal = await approveWithdrawal(id)
        return reply.send(withdrawal)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in PATCH /api/admin/withdrawals/:id/approve')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.patch(
    '/api/admin/withdrawals/:id/reject',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        const { note } = req.body as { note?: string }
        await rejectWithdrawal(id, note)
        return reply.send({ success: true })
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in PATCH /api/admin/withdrawals/:id/reject')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )
}
