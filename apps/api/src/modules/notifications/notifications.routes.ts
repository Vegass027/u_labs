import { FastifyInstance } from 'fastify';
import { getNotifications, markAsRead } from './notifications.service';
import { requireAuth } from '../../middleware/auth.middleware';

export async function notificationsRoutes(fastify: FastifyInstance) {
  // Получить уведомления текущего пользователя
  fastify.get('/api/notifications', { preHandler: [requireAuth] }, async (req, reply) => {
    if (!req.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const notifications = await getNotifications(req.user.id);
    return reply.send(notifications);
  });

  // Отметить уведомление как прочитанное
  fastify.patch('/api/notifications/:id/read', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!req.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    await markAsRead(id, req.user.id);
    return reply.send({ success: true });
  });
}
