import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
  createOrder,
  createManagerOrder,
  createOwnerOrder,
  getOrderById,
  listOrders,
  listManagerOrders,
  listClientOrders,
  updateOrderStatus,
  setOrderPrice,
  updateOrderRawText,
  deleteAiChat,
} from './orders.service'
import {
  createOrderSchema,
  createManagerOrderSchema,
  updateOrderStatusSchema,
  setOrderPriceSchema,
  listOrdersSchema,
  updateRawTextSchema,
} from './orders.schema'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'
import { requireAuth } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'
import { supabase } from '../../db/client'

interface CreateOrderBody {
  title: string
  raw_text?: string
}

interface CreateManagerOrderBody {
  title: string
  raw_text?: string
  client_user_id: string
}

interface UpdateOrderStatusBody {
  status: string
}

interface SetOrderPriceBody {
  price: number
}

export async function ordersRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/orders',
    { preHandler: [requireAuth, requireRole('client')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const validatedInput = createOrderSchema.parse(req.body)
        const order = await createOrder(validatedInput, req.user.id)
        return reply.status(201).send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in POST /api/orders')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.post(
    '/api/manager/orders',
    { preHandler: [requireAuth, requireRole('manager')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const validatedInput = createManagerOrderSchema.parse(req.body)
        const order = await createManagerOrder(validatedInput, req.user.id)
        return reply.status(201).send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in POST /api/manager/orders')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.post(
    '/api/admin/orders',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const validatedInput = createManagerOrderSchema.parse(req.body)
        const order = await createOwnerOrder(validatedInput, req.user.id)
        return reply.status(201).send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in POST /api/admin/orders')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get(
    '/api/manager/orders',
    { preHandler: [requireAuth, requireRole('manager')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const orders = await listManagerOrders(req.user.id)
        return reply.send(orders)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in GET /api/manager/orders')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.patch(
    '/api/manager/orders/:id/raw_text',
    { preHandler: [requireAuth, requireRole('manager', 'owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        const validatedInput = updateRawTextSchema.parse(req.body)
        const order = await updateOrderRawText(id, validatedInput.raw_text, req.user.id)
        return reply.send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in PATCH /api/manager/orders/:id/raw_text')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.patch(
    '/api/orders/:id/raw_text',
    { preHandler: [requireAuth, requireRole('client')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        const validatedInput = updateRawTextSchema.parse(req.body)
        const order = await updateOrderRawText(id, validatedInput.raw_text, req.user.id)
        return reply.send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in PATCH /api/orders/:id/raw_text')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.delete(
    '/api/orders/:id/ai-chat',
    { preHandler: [requireAuth, requireRole('client', 'manager', 'owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }

        await deleteAiChat(id, req.user.id, req.user.role)

        return reply.status(204).send()
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in DELETE /api/orders/:id/ai-chat')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get(
    '/api/admin/orders',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const filters = listOrdersSchema.parse(req.query)
        const result = await listOrders(filters, req.user.id)
        return reply.send(result)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in GET /api/admin/orders')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get(
    '/api/admin/orders/:id',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        const order = await getOrderById(id, req.user.id)
        return reply.send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in GET /api/admin/orders/:id')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.patch(
    '/api/admin/orders/:id/status',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        const validatedInput = updateOrderStatusSchema.parse(req.body)
        const order = await updateOrderStatus(id, validatedInput.status, req.user.id)
        return reply.send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in PATCH /api/admin/orders/:id/status')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.patch(
    '/api/admin/orders/:id/price',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        const validatedInput = setOrderPriceSchema.parse(req.body)
        const order = await setOrderPrice(id, validatedInput.price, req.user.id)
        return reply.send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in PATCH /api/admin/orders/:id/price')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get(
    '/api/orders/:id',
    { preHandler: [requireAuth] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!req.user) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const { id } = req.params as { id: string }
        const order = await getOrderById(id, req.user.id)
        return reply.send(order)
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({ error: error.message, code: error.code })
        }
        logger.error({ error }, 'Unexpected error in GET /api/orders/:id')
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )
}
