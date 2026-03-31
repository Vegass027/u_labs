/**
 * Шаблоны сообщений для Telegram уведомлений
 * Используют HTML форматирование: <b>bold</b>, <i>italic</i>, <a href="url">link</a>
 */

export function newOrderMessage(title: string, managerName?: string): string {
  const managerText = managerName ? `\n\n👤 Менеджер: ${managerName}` : '';
  return `<b>📋 Новая заявка</b>\n\n<b>Название:</b> ${title}${managerText}`;
}

export function statusChangeMessage(orderTitle: string, oldStatus: string, newStatus: string): string {
  const statusEmojis: Record<string, string> = {
    pending: '⏳',
    in_progress: '🔨',
    completed: '✅',
    cancelled: '❌',
  };

  const oldEmoji = statusEmojis[oldStatus] || '📌';
  const newEmoji = statusEmojis[newStatus] || '📌';

  return `<b>🔄 Статус заявки изменён</b>\n\n<b>Заявка:</b> ${orderTitle}\n\n${oldEmoji} <b>${oldStatus}</b> → ${newEmoji} <b>${newStatus}</b>`;
}

export function newMessageMessage(orderTitle: string, senderName: string): string {
  return `<b>💬 Новое сообщение</b>\n\n<b>Заявка:</b> ${orderTitle}\n\n👤 От: ${senderName}`;
}
