import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  message_type: z.enum(['client_manager', 'manager_owner']).default('client_manager'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
