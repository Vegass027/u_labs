import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { requireAuth } from '../../middleware/auth.middleware'
import { uploadAvatar, deleteAvatar } from './avatar.service'
import { updateUserProfile } from '../auth/profile.service'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import { supabase } from '../../db/client'

export async function avatarRoutes(fastify: FastifyInstance) {
  fastify.post('/api/storage/avatar', {
    preHandler: [requireAuth],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const data = await req.file()

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' })
      }

      const buffer = await data.toBuffer()

      const { url } = await uploadAvatar(user.id, buffer, data.filename, data.mimetype)

      const updatedUser = await updateUserProfile(user.id, { avatar_url: url })

      return reply.send(updatedUser)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code })
      }
      logger.error({ error }, 'Unexpected error in POST /api/storage/avatar')
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.delete('/api/storage/avatar', {
    preHandler: [requireAuth],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const { data: userData } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (userData?.avatar_url) {
        const filePath = userData.avatar_url.split('/').pop()
        if (filePath) {
          await deleteAvatar(`avatars/${user.id}/${filePath}`)
        }
      }

      const updatedUser = await updateUserProfile(user.id, { avatar_url: undefined })

      return reply.send(updatedUser)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code })
      }
      logger.error({ error }, 'Unexpected error in DELETE /api/storage/avatar')
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
