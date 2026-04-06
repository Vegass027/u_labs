import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { requireAuth } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'
import { AppError, NotFoundError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import { createIndustrySchema, updateIndustrySchema } from './industries.schema'
import { getAllIndustries, getIndustryById, createIndustry, updateIndustry, deleteIndustry } from './industries.service'

export async function industriesRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/api/admin/industries',
    {
      preHandler: [
        requireAuth,
        requireRole('owner'),
      ],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const industries = await getAllIndustries()
        return reply.send(industries)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message })
        }
        logger.error({ error }, 'Unexpected error in GET /industries')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get(
    '/api/admin/industries/:id',
    {
      preHandler: [
        requireAuth,
        requireRole('owner'),
      ],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = req.params as { id: string }
        const industry = await getIndustryById(id)
        return reply.send(industry)
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message })
        }
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message })
        }
        logger.error({ error }, 'Unexpected error in GET /industries/:id')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.post(
    '/api/admin/industries',
    {
      preHandler: [
        requireAuth,
        requireRole('owner'),
      ],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const input = createIndustrySchema.parse(req.body)
        const industry = await createIndustry(input)
        return reply.status(201).send(industry)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message })
        }
        logger.error({ error }, 'Unexpected error in POST /industries')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.patch(
    '/api/admin/industries/:id',
    {
      preHandler: [
        requireAuth,
        requireRole('owner'),
      ],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = req.params as { id: string }
        const input = updateIndustrySchema.parse(req.body)
        const industry = await updateIndustry(id, input)
        return reply.send(industry)
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message })
        }
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message })
        }
        logger.error({ error }, 'Unexpected error in PATCH /industries/:id')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.delete(
    '/api/admin/industries/:id',
    {
      preHandler: [
        requireAuth,
        requireRole('owner'),
      ],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = req.params as { id: string }
        await deleteIndustry(id)
        return reply.status(204).send()
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message })
        }
        logger.error({ error }, 'Unexpected error in DELETE /industries/:id')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )
}
