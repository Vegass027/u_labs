import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { config } from './config'
import { logger } from './utils/logger'
import { authRoutes } from './modules/auth/auth.routes'
import { ordersRoutes } from './modules/orders/orders.routes'
import { aiRoutes } from './modules/ai/ai.routes'
import { messagesRoutes } from './modules/messages/messages.routes'
import { commissionsRoutes } from './modules/commissions/commissions.routes'
import { notificationsRoutes } from './modules/notifications/notifications.routes'
import { telegramRoutes } from './modules/notifications/telegram.routes'

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
  attachFieldsToBody: true,
  sharedSchemaId: 'MultipartFile',
})

// Auth routes
server.register(authRoutes, { prefix: '/api/auth' })

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
