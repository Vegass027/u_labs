import type { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../db/client'
import { UnauthorizedError } from '../utils/errors'
import { logger } from '../utils/logger'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      role: string
    }
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7)

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    logger.error({ error, userId: user?.id }, 'Invalid or expired token')
    throw new UnauthorizedError('Invalid or expired token')
  }

  req.user = {
    id: user.id,
    email: user.email || '',
    role: user.user_metadata?.role || 'client',
  }
}
