import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { config } from './config'
import { logger } from './utils/logger'
import { authRoutes } from './modules/auth/auth.routes'
import { profileRoutes } from './modules/auth/profile.routes'
import { ordersRoutes } from './modules/orders/orders.routes'
import { aiRoutes } from './modules/ai/ai.routes'
import { messagesRoutes } from './modules/messages/messages.routes'
import { commissionsRoutes } from './modules/commissions/commissions.routes'
import { notificationsRoutes } from './modules/notifications/notifications.routes'
import { telegramRoutes } from './modules/notifications/telegram.routes'
import { documentsRoutes } from './modules/documents/documents.routes'
import { avatarRoutes } from './modules/storage/avatar.routes'
import { withdrawalsRoutes } from './modules/withdrawals/withdrawals.routes'

const server = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

// CORS
server.register(cors, {
  origin: config.CORS_ORIGINS.split(','),
  credentials: true,
})

// Multipart для загрузки файлов
server.register(multipart, {
  attachFieldsToBody: false,
  sharedSchemaId: 'MultipartFile',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})

// Auth routes
server.register(authRoutes, { prefix: '/api/auth' })

// Profile routes (уже содержит префикс /api/auth в определении роутов)
server.register(profileRoutes)

// Orders routes
server.register(ordersRoutes)

// AI routes
server.register(aiRoutes)

// Messages routes
server.register(messagesRoutes)

// Commissions routes
server.register(commissionsRoutes)

// Notifications routes
server.register(notificationsRoutes)

// Telegram webhook routes
server.register(telegramRoutes)

// Documents routes
server.register(documentsRoutes)

// Avatar routes
server.register(avatarRoutes)

// Withdrawals routes
server.register(withdrawalsRoutes)

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Start server
const start = async () => {
  try {
    await server.listen({ port: config.PORT, host: '0.0.0.0' })
    server.log.info(`Server listening on port ${config.PORT}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
