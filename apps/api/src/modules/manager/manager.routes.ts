import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
  getManagerPaymentDetails,
  updateManagerPaymentDetails,
} from './manager.service'
import {
  updatePaymentDetailsSchema,
} from './manager.schema'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import { requireAuth } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'

export async function managerRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/api/manager/payment-details',
    { preHandler: [requireAuth, requireRole('manager')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const paymentDetails = await getManagerPaymentDetails(req.user.id)
        return reply.send(paymentDetails)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in GET /api/manager/payment-details')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.patch(
    '/api/manager/payment-details',
    { preHandler: [requireAuth, requireRole('manager')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const validatedInput = updatePaymentDetailsSchema.parse(req.body)
        const paymentDetails = await updateManagerPaymentDetails(validatedInput, req.user.id)
        return reply.send(paymentDetails)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in PATCH /api/manager/payment-details')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )
}
