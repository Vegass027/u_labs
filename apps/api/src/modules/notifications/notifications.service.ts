import { supabase } from '../../db/client';
import { logger } from '../../utils/logger';
import type { OrderStatus } from '@agency/types';

export interface CreateNotificationInput {
  userId: string;
  orderId: string;
  type: 'new_order' | 'status_change' | 'new_message' | 'price_set';
  title: string;
  body?: string;
}

const statusLabels: Record<OrderStatus, string> = {
  new: 'Новая',
  reviewing: 'На рассмотрении',
  proposal_sent: 'Предложение отправлено',
  contract_signed: 'Договор подписан',
  in_development: 'В разработке',
  done: 'Завершён',
  rejected: 'Отклонён',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

/**
 * Создание уведомления
 */
export async function createNotification(
  userId: string,
  orderId: string,
  type: 'new_order' | 'status_change' | 'new_message' | 'price_set',
  title: string,
  body?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      order_id: orderId,
      type,
      title,
      body,
      is_read: false,
    });

    if (error) {
      logger.error('Failed to create notification', { error, userId, orderId, type });
    }
  } catch (error) {
    logger.error('Failed to create notification', { error, userId, orderId, type });
  }
}

export async function createNewOrderNotification(userId: string, orderId: string, orderTitle: string): Promise<void> {
  await createNotification(
    userId,
    orderId,
    'new_order',
    'Заявка принята',
    `Ожидайте ответа команды по проекту "${orderTitle}"`
  );
}

export async function createStatusChangeNotification(
  userId: string,
  orderId: string,
  orderTitle: string,
  newStatus: OrderStatus
): Promise<void> {
  await createNotification(
    userId,
    orderId,
    'status_change',
    'Статус проекта изменён',
    `"${orderTitle}" → ${statusLabels[newStatus]}`
  );
}

export async function createPriceSetNotification(
  userId: string,
  orderId: string,
  orderTitle: string,
  price: number
): Promise<void> {
  await createNotification(
    userId,
    orderId,
    'price_set',
    'Выставлена стоимость',
    `По проекту "${orderTitle}": ${formatPrice(price)}`
  );
}

export async function createNewMessageNotification(
  userId: string,
  orderId: string,
  orderTitle: string
): Promise<void> {
  await createNotification(
    userId,
    orderId,
    'new_message',
    'Команда ответила',
    `Новое сообщение по проекту "${orderTitle}"`
  );
}

/**
 * Получение уведомлений пользователя
 * Непрочитанные идут первыми
 */
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('is_read', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch notifications', { error, userId });
    throw new Error('Failed to fetch notifications');
  }

  return data;
}

/**
 * Отметка уведомления как прочитанного
 */
export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Failed to mark notification as read', { error, notificationId, userId });
    throw new Error('Failed to mark notification as read');
  }
}
