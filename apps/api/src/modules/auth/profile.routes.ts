import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { requireAuth } from '../../middleware/auth.middleware'
import { updateUserProfile, updateNotificationPreferences } from './profile.service'
import { updateProfileSchema, updateNotificationPreferencesSchema } from './profile.schema'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'

interface ProfileRequestBody {
  full_name?: string
  phone?: string
  avatar_url?: string
}

interface NotificationPreferencesRequestBody {
  new_orders?: boolean
  status_changes?: boolean
  new_messages?: boolean
}

export async function profileRoutes(fastify: FastifyInstance) {
  fastify.patch('/api/auth/profile', {
    preHandler: [requireAuth],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      logger.info({ body: req.body }, 'PATCH /api/auth/profile request body')
      const validatedInput = updateProfileSchema.parse(req.body)
      logger.info({ validatedInput }, 'PATCH /api/auth/profile validated input')
      const updatedUser = await updateUserProfile(user.id, validatedInput)
      return reply.send(updatedUser)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code })
      }
      logger.error({ error }, 'Unexpected error in PATCH /api/auth/profile')
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.patch('/api/auth/notification-preferences', {
    preHandler: [requireAuth],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const validatedInput = updateNotificationPreferencesSchema.parse(req.body)
      const updatedUser = await updateNotificationPreferences(user.id, validatedInput)
      return reply.send(updatedUser)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code })
      }
      logger.error({ error }, 'Unexpected error in PATCH /api/auth/notification-preferences')
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
