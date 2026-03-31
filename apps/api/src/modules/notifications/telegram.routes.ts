import { FastifyInstance } from 'fastify';
import { config, telegramConfig } from '../../config';
import { logger } from '../../utils/logger';
import { supabase } from '../../db/client';

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface TelegramWebhookRequest {
  body: TelegramUpdate;
}

// In-memory storage for pending links
// NOTE: This is in-memory and will be lost on server restart.
// For production, use Redis or database for persistence.
const pendingLinks = new Map<number, { waitingForEmail: boolean }>();

export async function telegramRoutes(fastify: FastifyInstance) {
  // Webhook endpoint for Telegram
  fastify.post('/api/telegram/webhook', async (req, reply) => {
    // Verify secret header
    const secretToken = req.headers['x-telegram-bot-api-secret-token'];
    if (secretToken !== telegramConfig.webhookSecret) {
      return reply.status(403).send({ error: 'Invalid secret token' });
    }

    const update = req.body as TelegramUpdate;
    const message = update.message;

    if (!message) {
      return reply.status(200).send({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    if (!text) {
      return reply.status(200).send({ ok: true });
    }

    try {
      // Handle /start command
      if (text === '/start') {
        pendingLinks.set(chatId, { waitingForEmail: true });
        await sendTelegramMessage(chatId, 'Отправьте ваш email для привязки аккаунта');
        return reply.status(200).send({ ok: true });
      }

      // Handle email input
      const pendingLink = pendingLinks.get(chatId);
      if (pendingLink?.waitingForEmail) {
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
          await sendTelegramMessage(chatId, 'Неверный формат email. Пожалуйста, введите корректный email.');
          return reply.status(200).send({ ok: true });
        }

        // Find user by email
        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, full_name')
          .eq('email', text)
          .single();

        if (error || !user) {
          await sendTelegramMessage(chatId, 'Пользователь с таким email не найден.');
          pendingLinks.delete(chatId);
          return reply.status(200).send({ ok: true });
        }

        // Update user with telegram_chat_id
        const { error: updateError } = await supabase
          .from('users')
          .update({ telegram_chat_id: chatId.toString() })
          .eq('id', user.id);

        if (updateError) {
          logger.error('Failed to update user telegram_chat_id', { error: updateError, userId: user.id });
          await sendTelegramMessage(chatId, 'Ошибка при привязке аккаунта. Попробуйте позже.');
        } else {
          await sendTelegramMessage(chatId, `Аккаунт привязан! Теперь вы будете получать уведомления.`);
        }

        pendingLinks.delete(chatId);
        return reply.status(200).send({ ok: true });
      }

      // Unknown command
      await sendTelegramMessage(chatId, 'Для привязки аккаунта отправьте команду /start');
    } catch (error) {
      logger.error('Error processing Telegram webhook', { error, chatId });
    }

    return reply.status(200).send({ ok: true });
  });
}

async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
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
