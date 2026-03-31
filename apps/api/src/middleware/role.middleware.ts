import type { FastifyRequest, FastifyReply } from 'fastify'
import type { UserRole } from '@agency/types'
import { ForbiddenError } from '../utils/errors'
import { logger } from '../utils/logger'

export function requireRole(...allowedRoles: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = (req as any).user

    if (!user) {
      throw new ForbiddenError('User not authenticated')
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      logger.warn({ userId: user.id, userRole: user.role, allowedRoles }, 'Access denied: insufficient role')
      throw new ForbiddenError('Access denied: insufficient permissions')
    }
  }
}
