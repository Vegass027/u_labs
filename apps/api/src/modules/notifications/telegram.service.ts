import { config, telegramConfig } from '../../config';
import { logger } from '../../utils/logger';
import { supabase } from '../../db/client';
import { newOrderMessage, statusChangeMessage, newMessageMessage } from './message-templates';

interface Order {
  id: string;
  title: string;
  status: string;
  client_user_id?: string | null;
  manager_user_id?: string | null;
}

interface User {
  id: string;
  email: string;
  telegram_chat_id?: string;
  full_name?: string;
}

/**
 * Отправка сообщения в Telegram
 * Ошибки логируются, но не пробрасываются наверх - уведомление не должно ломать основной поток
 */
export async function sendMessage(chatId: string, text: string): Promise<void> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Telegram API error: ${response.status} ${errorText}`);
    }
  } catch (error) {
    logger.error('Failed to send Telegram message', { error, chatId });
  }
}

/**
 * Уведомление о новой заявке
 * Отправляется owner всегда, и менеджеру если он назначен и имеет telegram_chat_id
 */
export async function notifyNewOrder(order: Order, managerName?: string): Promise<void> {
  try {
    // Получаем owner (первый пользователь с ролью owner)
    const { data: ownerData, error: ownerError } = await supabase
      .from('users')
      .select('id, telegram_chat_id')
      .eq('role', 'owner')
      .limit(1)
      .single();

    if (ownerError) {
      logger.error('Failed to fetch owner for notification', { error: ownerError });
      return;
    }

    if (ownerData?.telegram_chat_id) {
      const message = newOrderMessage(order.title, managerName);
      await sendMessage(ownerData.telegram_chat_id, message);
    }

    // Если есть менеджер и у него есть telegram_chat_id - тоже уведомляем
    if (order.manager_user_id) {
      const { data: managerData, error: managerError } = await supabase
        .from('users')
        .select('telegram_chat_id')
        .eq('id', order.manager_user_id)
        .single();

      if (!managerError && managerData?.telegram_chat_id) {
        const message = newOrderMessage(order.title, managerName);
        await sendMessage(managerData.telegram_chat_id, message);
      }
    }
  } catch (error) {
    logger.error('Failed to notify about new order', { error, orderId: order.id });
  }
}

/**
 * Уведомление об изменении статуса заявки
 */
export async function notifyStatusChange(
  order: Order,
  newStatus: string,
  recipientChatId: string
): Promise<void> {
  try {
    const message = statusChangeMessage(order.title, order.status, newStatus);
    await sendMessage(recipientChatId, message);
  } catch (error) {
    logger.error('Failed to notify about status change', { error, orderId: order.id });
  }
}

/**
 * Уведомление о новом сообщении
 */
export async function notifyNewMessage(
  orderId: string,
  orderTitle: string,
  recipientChatId: string,
  senderName: string
): Promise<void> {
  try {
    const message = newMessageMessage(orderTitle, senderName);
    await sendMessage(recipientChatId, message);
  } catch (error) {
    logger.error('Failed to notify about new message', { error, orderId });
  }
}
