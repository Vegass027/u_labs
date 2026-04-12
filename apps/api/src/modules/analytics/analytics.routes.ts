import { FastifyInstance } from 'fastify'
import { getRevenueAnalytics } from './analytics.service'
import { requireAuth } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/api/admin/analytics/revenue',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (_req, reply) => {
      const data = await getRevenueAnalytics()
      return reply.send(data)
    }
  )
}
