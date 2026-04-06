import { supabase } from '../../db/client';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { notifyNewMessage } from '../notifications/telegram.service';
import { createNewMessageNotification } from '../notifications/notifications.service';

export async function getOrderMessages(
  orderId: string, 
  userId: string, 
  userRole: string,
  messageType?: 'client_manager' | 'manager_owner'
) {
  // Проверка доступа к заказу
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('client_user_id, manager_user_id')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new NotFoundError('Order not found');
  }

  // Owner видит все, manager только свои, client только свои
  if (userRole === 'manager' && order.manager_user_id !== userId) {
    throw new ForbiddenError('Access denied');
  } else if (userRole === 'client' && order.client_user_id !== userId) {
    throw new ForbiddenError('Access denied');
  }

  // Загружаем сообщения с именами отправителей и фильтрацией по типу
  let query = supabase
    .from('order_messages')
    .select(`
      *,
      sender:users!order_messages_sender_id_fkey(full_name)
    `)
    .eq('order_id', orderId);

  if (messageType) {
    query = query.eq('message_type', messageType);
  }

  const { data: messages, error } = await query.order('created_at', { ascending: true });

  if (error) {
    logger.error({ error, orderId }, 'Failed to fetch order messages');
    throw new Error('Failed to fetch messages');
  }

  // Форматируем ответ
  return messages?.map((msg: any) => ({
    id: msg.id,
    order_id: msg.order_id,
    sender_id: msg.sender_id,
    sender_name: (msg.sender as any)?.full_name || 'Unknown',
    content: msg.content,
    created_at: msg.created_at,
  })) || [];
}

export async function sendMessage(
  orderId: string, 
  senderId: string, 
  content: string, 
  userRole: string,
  messageType: 'client_manager' | 'manager_owner'
) {
  // Проверка доступа к заказу
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('client_user_id, manager_user_id, title')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new NotFoundError('Order not found');
  }

  // Проверка прав доступа
  if (userRole === 'manager' && order.manager_user_id !== senderId) {
    throw new ForbiddenError('Access denied');
  } else if (userRole === 'client' && order.client_user_id !== senderId) {
    throw new ForbiddenError('Access denied');
  }

  // Создаем сообщение с указанным типом
  const { data: message, error } = await supabase
    .from('order_messages')
    .insert({
      order_id: orderId,
      sender_id: senderId,
      content,
      message_type: messageType,
    })
    .select(`
      *,
      sender:users!order_messages_sender_id_fkey(full_name)
    `)
    .single();

  if (error) {
    logger.error({ error, orderId, senderId }, 'Failed to send message');
    throw new Error('Failed to send message');
  }

  const senderName = (message.sender as any)?.full_name || 'Unknown';

  // Отправляем уведомления получателям (не отправителю)
  const recipients: string[] = [];

  if (order.manager_user_id && order.manager_user_id !== senderId) {
    recipients.push(order.manager_user_id);
  }
  if (order.client_user_id && order.client_user_id !== senderId) {
    recipients.push(order.client_user_id);
  }

  for (const recipientId of recipients) {
    // Telegram уведомление
    const { data: recipientData } = await supabase
      .from('users')
      .select('telegram_chat_id')
      .eq('id', recipientId)
      .single();

    if (recipientData?.telegram_chat_id) {
      await notifyNewMessage(orderId, order.title, recipientData.telegram_chat_id, senderName);
    }

    // In-app уведомление
    await createNewMessageNotification(recipientId, orderId, order.title);
  }

  return {
    id: message.id,
    order_id: message.order_id,
    sender_id: message.sender_id,
    sender_name: senderName,
    content: message.content,
    created_at: message.created_at,
  };
}
