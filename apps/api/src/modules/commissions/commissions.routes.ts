import { FastifyInstance } from 'fastify';
import { listCommissions, markAsPaid, getManagerBalance } from './commissions.service';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export async function commissionsRoutes(fastify: FastifyInstance) {
  // Получить список комиссий (только owner)
  fastify.get(
    '/api/admin/commissions',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req, reply) => {
      const query = req.query as { managerId?: string; status?: string };
      const filters: { managerId?: string; status?: string } = {};

      if (query.managerId) {
        filters.managerId = query.managerId;
      }

      if (query.status) {
        filters.status = query.status;
      }

      const commissions = await listCommissions(filters);
      return reply.send(commissions);
    }
  );

  // Отметить комиссию как оплаченную (только owner)
  fastify.patch(
    '/api/admin/commissions/:id/pay',
    { preHandler: [requireAuth, requireRole('owner')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      await markAsPaid(id);
      return reply.send({ success: true });
    }
  );

  // Получить баланс менеджера
  fastify.get(
    '/api/manager/balance',
    { preHandler: [requireAuth, requireRole('manager')] },
    async (req, reply) => {
      const userId = (req as any).user.id;

      const balance = await getManagerBalance(userId);
      return reply.send(balance);
    }
  );
}
