import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:      z.enum(['development', 'production', 'test']).default('development'),
  PORT:          z.coerce.number().default(3001),
  API_URL:       z.string().url(),
  WEB_URL:       z.string().url(),

  DATABASE_URL:  z.string().min(1).optional(),

  JWT_ACCESS_SECRET:      z.string().min(32),
  JWT_REFRESH_SECRET:     z.string().min(32),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  OPENAI_API_KEY: z.string().startsWith('sk-'),

  TELEGRAM_BOT_TOKEN:      z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('ENV error:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data

// Дополнительные объекты для удобства
export const openaiConfig = {
  apiKey: config.OPENAI_API_KEY,
}

export const telegramConfig = {
  botToken: config.TELEGRAM_BOT_TOKEN,
  webhookSecret: config.TELEGRAM_WEBHOOK_SECRET,
}

export const supabaseConfig = {
  url: config.SUPABASE_URL,
  serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
}
