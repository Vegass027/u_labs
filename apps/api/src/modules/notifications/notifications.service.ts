import { supabase } from '../../db/client';
import { logger } from '../../utils/logger';

export interface CreateNotificationInput {
  userId: string;
  orderId: string;
  type: 'new_order' | 'status_change' | 'new_message';
  title: string;
  body?: string;
}

/**
 * Создание уведомления
 */
export async function createNotification(
  userId: string,
  orderId: string,
  type: 'new_order' | 'status_change' | 'new_message',
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
