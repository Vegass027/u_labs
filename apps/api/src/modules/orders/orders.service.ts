import { supabase } from '../../db/client'
import { logger } from '../../utils/logger'
import { AppError, NotFoundError, ForbiddenError } from '../../utils/errors'
import type { Order, OrderStatus } from '@agency/types'
import type { CreateOrderInput, CreateManagerOrderInput, ListOrdersInput } from './orders.schema'
import { notifyNewOrder, notifyStatusChange } from '../notifications/telegram.service'
import { createNotification } from '../notifications/notifications.service'

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
    await createNotification(
      ownerData.id,
      data.id,
      'new_order',
      'Новая заявка',
      data.title
    )
  }

  return data
}

export async function createManagerOrder(input: CreateManagerOrderInput, managerUserId: string): Promise<Order> {
  logger.info({ managerUserId, title: input.title, clientId: input.client_user_id }, 'Manager creating order for client')

  const { data, error } = await supabase
    .from('orders')
    .insert({
      client_user_id: input.client_user_id,
      manager_user_id: managerUserId,
      title: input.title,
      raw_text: input.raw_text,
      status: 'new',
    })
    .select()
    .single()

  if (error || !data) {
    logger.error({ error }, 'Failed to create manager order')
    throw new AppError(error?.message || 'Failed to create order', 500)
  }

  logger.info({ orderId: data.id }, 'Manager order created successfully')

  // Get manager name for notification
  const { data: managerData } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', managerUserId)
    .single()

  // Send notifications
  await notifyNewOrder(data, managerData?.full_name)

  // Get owner for in-app notification
  const { data: ownerData } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'owner')
    .limit(1)
    .single()

  if (ownerData) {
    await createNotification(
      ownerData.id,
      data.id,
      'new_order',
      'Новая заявка',
      data.title
    )
  }

  return data
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

    await createNotification(
      data.manager_user_id,
      data.id,
      'status_change',
      'Статус заявки изменён',
      data.title
    )
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

    await createNotification(
      data.client_user_id,
      data.id,
      'status_change',
      'Статус заявки изменён',
      data.title
    )
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

  return data
}
