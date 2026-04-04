import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { registerUser, logoutUser, getCurrentUser, updateUserTelegram } from './auth.service'
import { registerSchema } from './auth.schema'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import { requireAuth } from '../../middleware/auth.middleware'

interface RegisterBody {
  email: string
  password: string
  role: 'manager' | 'client'
  fullName: string
  phone?: string
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (req: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    try {
      const validatedInput = registerSchema.parse(req.body)
      const user = await registerUser(validatedInput)
      return reply.status(201).send(user)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code })
      }
      logger.error({ error }, 'Unexpected error in register')
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.post('/logout', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Missing or invalid authorization header' })
      }

      const token = authHeader.substring(7)
      await logoutUser(token)
      return reply.send({ success: true })
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code })
      }
      logger.error({ error }, 'Unexpected error in logout')
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.get('/me', { preHandler: [requireAuth] }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const userData = await getCurrentUser(user.id)
      return reply.send(userData)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code })
      }
      logger.error({ error }, 'Unexpected error in /me')
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.patch('/me', { preHandler: [requireAuth] }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const { telegram_chat_id } = req.body as any
      const userData = await updateUserTelegram(user.id, telegram_chat_id)
      return reply.send(userData)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code })
      }
      logger.error({ error }, 'Unexpected error in PATCH /me')
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
