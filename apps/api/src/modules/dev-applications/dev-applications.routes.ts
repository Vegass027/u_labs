import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { submitDeveloperApplication } from './dev-applications.service'
import { createDeveloperApplicationSchema } from './dev-applications.schema'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'

export async function devApplicationsRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/dev-applications',
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const validatedInput = createDeveloperApplicationSchema.parse(req.body)
        const result = await submitDeveloperApplication(validatedInput)
        return reply.status(201).send(result)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in POST /api/dev-applications')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )
}
