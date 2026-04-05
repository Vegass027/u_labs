import { FastifyInstance } from 'fastify';
import { sendMessageSchema } from './messages.schema';
import { getOrderMessages, sendMessage } from './messages.service';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export async function messagesRoutes(fastify: FastifyInstance) {
  // Получить сообщения заказа
  fastify.get(
    '/api/orders/:id/messages',
    { preHandler: [requireAuth] },
    async (req, reply) => {
      const { id: orderId } = req.params as { id: string };
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { type } = req.query as { type?: 'client_manager' | 'manager_owner' };

      const messages = await getOrderMessages(orderId, userId, userRole, type);
      return reply.send(messages);
    }
  );

  // Отправить сообщение в заказ
  fastify.post(
    '/api/orders/:id/messages',
    { preHandler: [requireAuth] },
    async (req, reply) => {
      const { id: orderId } = req.params as { id: string };
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const body = sendMessageSchema.parse(req.body);

      const message = await sendMessage(orderId, userId, body.content, userRole, body.message_type);
      return reply.status(201).send(message);
    }
  );
}
