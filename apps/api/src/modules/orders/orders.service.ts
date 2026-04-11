import { supabase, supabaseAdmin } from '../../db/client'
import { logger } from '../../utils/logger'
import { AppError, NotFoundError, ForbiddenError } from '../../utils/errors'
import { config } from '../../config'
import type { Order, OrderStatus } from '@agency/types'
import type { CreateOrderInput, CreateManagerOrderInput, ListOrdersInput } from './orders.schema'
import { notifyNewOrder, notifyStatusChange } from '../notifications/telegram.service'
import {
  createNewOrderNotification,
  createStatusChangeNotification,
  createPriceSetNotification,
} from '../notifications/notifications.service'

export async function createOrder(input: CreateOrderInput, clientUserId: string): Promise<Order> {
  logger.info({ clientUserId, title: input.title }, 'Creating new order')

  const insertData = {
    client_user_id: clientUserId,
    manager_user_id: null,
    title: input.title,
    raw_text: input.raw_text ?? null,
    status: 'new' as const,
  }

  logger.info({ insertData }, 'Inserting order data')

  const { data, error } = await supabase
    .from('orders')
    .insert(insertData)
    .select()
    .single()

  if (error || !data) {
    logger.error({ error }, 'Failed to create order')
    throw new AppError(error?.message || 'Failed to create order', 500)
  }

  logger.info({ orderId: data.id }, 'Order created successfully')

  // Send notifications
  await notifyNewOrder(data)

  // Get owner for in-app notification
  const { data: ownerData } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'owner')
    .limit(1)
    .single()

  if (ownerData) {
    await createNewOrderNotification(ownerData.id, data.id, data.title)
  }

  return data
}

async function createOrderAndLinkClient(
  input: CreateManagerOrderInput,
  managerUserId: string | null
): Promise<Order> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      client_name: input.client_name,
      client_contact: input.client_email || null,
      manager_user_id: managerUserId,
      title: input.title,
      raw_text: input.raw_text,
      status: 'new',
    })
    .select()
    .single()

  if (orderError || !order) {
    logger.error({ error: orderError }, 'Failed to create order')
    throw new AppError(orderError?.message || 'Failed to create order', 500)
  }

  logger.info({ orderId: order.id, managerUserId }, 'Order created successfully')

  if (input.client_email) {
    const { data: existingClient } = await supabase
      .from('users')
      .select('id')
      .eq('email', input.client_email)
      .limit(1)
      .single()

    if (existingClient) {
      await supabase
        .from('orders')
        .update({ client_user_id: existingClient.id })
        .eq('id', order.id)
      logger.info({ orderId: order.id, clientId: existingClient.id }, 'Linked existing client to order')
    } else {
      await inviteClient(input.client_email, input.client_name, order.id)
    }
  }

  return order
}

export async function createManagerOrder(input: CreateManagerOrderInput, managerUserId: string): Promise<Order> {
  logger.info({ managerUserId, title: input.title, clientEmail: input.client_email }, 'Manager creating order for client')

  const order = await createOrderAndLinkClient(input, managerUserId)

  const { data: managerData } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', managerUserId)
    .single()

  await notifyNewOrder(order, managerData?.full_name)

  const { data: ownerData } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'owner')
    .limit(1)
    .single()

  if (ownerData) {
    await createNewOrderNotification(ownerData.id, order.id, order.title)
  }

  return order
}

export async function createOwnerOrder(input: CreateManagerOrderInput, ownerUserId: string): Promise<Order> {
  logger.info({ ownerUserId, title: input.title, clientEmail: input.client_email }, 'Owner creating order for client')

  const order = await createOrderAndLinkClient(input, null)

  await createNewOrderNotification(ownerUserId, order.id, order.title)

  return order
}

async function inviteClient(email: string, fullName: string, orderId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      role: 'client',
      full_name: fullName,
      password_set: false,
    },
    redirectTo: `${config.WEB_URL}/auth/callback`,
  })

  logger.info({ email, orderId, data, error }, 'Invite result')

  if (error) {
    logger.error({ email, error }, 'Failed to invite client')
    throw error
  }
}

export async function getOrderById(orderId: string, userId: string): Promise<Order> {
  logger.info({ orderId, userId }, 'Fetching order by ID')

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !data) {
    logger.error({ error, orderId }, 'Failed to fetch order')
    throw new NotFoundError('Order not found')
  }

  return data
}

export async function listOrders(filters: ListOrdersInput, userId: string): Promise<{ orders: Order[]; total: number }> {
  logger.info({ filters, userId }, 'Listing all orders (owner)')

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1)

  if (error) {
    logger.error({ error }, 'Failed to list orders')
    throw new AppError(error.message, 500)
  }

  return {
    orders: data || [],
    total: count || 0,
  }
}

export async function listManagerOrders(managerUserId: string): Promise<Order[]> {
  logger.info({ managerUserId }, 'Listing manager orders')

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('manager_user_id', managerUserId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error({ error }, 'Failed to list manager orders')
    throw new AppError(error.message, 500)
  }

  return data || []
}

export async function listClientOrders(clientUserId: string): Promise<Order[]> {
  logger.info({ clientUserId }, 'Listing client orders')

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('client_user_id', clientUserId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error({ error }, 'Failed to list client orders')
    throw new AppError(error.message, 500)
  }

  return data || []
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, userId: string): Promise<Order> {
  logger.info({ orderId, status, userId }, 'Updating order status')

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error || !data) {
    logger.error({ error, orderId }, 'Failed to update order status')
    throw new AppError(error?.message || 'Failed to update order status', 500)
  }

  logger.info({ orderId, status }, 'Order status updated successfully')

  // Send notifications to manager and client if they have telegram_chat_id
  if (data.manager_user_id) {
    const { data: managerData } = await supabase
      .from('users')
      .select('telegram_chat_id')
      .eq('id', data.manager_user_id)
      .single()

    if (managerData?.telegram_chat_id) {
      await notifyStatusChange(data, status, managerData.telegram_chat_id)
    }

    await createStatusChangeNotification(data.manager_user_id, data.id, data.title, status)
  }

  if (data.client_user_id) {
    const { data: clientData } = await supabase
      .from('users')
      .select('telegram_chat_id')
      .eq('id', data.client_user_id)
      .single()

    if (clientData?.telegram_chat_id) {
      await notifyStatusChange(data, status, clientData.telegram_chat_id)
    }

    await createStatusChangeNotification(data.client_user_id, data.id, data.title, status)
  }

  return data
}

export async function setOrderPrice(orderId: string, price: number, userId: string): Promise<Order> {
  logger.info({ orderId, price, userId }, 'Setting order price')

  const managerCommission = price * 0.3

  const { data, error } = await supabase
    .from('orders')
    .update({
      price,
      manager_commission: managerCommission,
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error || !data) {
    logger.error({ error, orderId }, 'Failed to set order price')
    throw new AppError(error?.message || 'Failed to set order price', 500)
  }

  logger.info({ orderId, price, managerCommission }, 'Order price set successfully')

  // Send notifications to client and manager
  if (data.client_user_id) {
    await createPriceSetNotification(data.client_user_id, data.id, data.title, price)
  }

  if (data.manager_user_id) {
    await createPriceSetNotification(data.manager_user_id, data.id, data.title, price)
  }

  return data
}

export async function updateOrderRawText(orderId: string, rawText: string, userId: string): Promise<Order> {
  logger.info({ orderId, userId }, 'Updating order raw_text')

  const { data, error } = await supabase
    .from('orders')
    .update({
      raw_text: rawText,
      structured_brief: null
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error || !data) {
    logger.error({ error, orderId }, 'Failed to update order raw_text')
    throw new AppError(error?.message || 'Failed to update order raw_text', 500)
  }

  logger.info({ orderId }, 'Order raw_text updated successfully, structured_brief cleared')

  return data
}

export async function deleteAiChat(orderId: string, userId: string, userRole: string): Promise<void> {
  logger.info({ orderId, userId, userRole }, 'Deleting AI chat messages')

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('client_user_id, manager_user_id')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    logger.error({ error: orderError, orderId }, 'Failed to fetch order')
    throw new NotFoundError('Order not found')
  }

  if (userRole === 'client' && order.client_user_id !== userId) {
    logger.warn({ orderId, userId }, 'Unauthorized attempt to delete AI chat')
    throw new ForbiddenError('Unauthorized')
  }

  if (userRole === 'manager' && order.manager_user_id !== userId) {
    logger.warn({ orderId, userId }, 'Unauthorized attempt to delete AI chat')
    throw new ForbiddenError('Unauthorized')
  }

  const { error: deleteError } = await supabase
    .from('ai_chat_messages')
    .delete()
    .eq('order_id', orderId)
    .eq('user_role', userRole)

  if (deleteError) {
    logger.error({ error: deleteError, orderId }, 'Failed to delete AI chat messages')
    throw new AppError('Failed to delete AI chat', 500)
  }

  logger.info({ orderId, userRole }, 'AI chat messages deleted successfully')
}

