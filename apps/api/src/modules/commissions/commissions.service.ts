import { supabase } from '../../db/client';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export async function listCommissions(filters?: { managerId?: string; status?: string }) {
  let query = supabase
    .from('commission_transactions')
    .select(`
      *,
      manager:users!commission_transactions_manager_user_id_fkey(
        id,
        full_name
      ),
      order:orders!commission_transactions_order_id_fkey(
        id,
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.managerId) {
    query = query.eq('manager_user_id', filters.managerId);
  }

  if (filters?.status) {
    query = query.eq('tx_status', filters.status);
  }

  const { data: commissions, error } = await query;

  if (error) {
    logger.error({ error, filters }, 'Failed to list commissions');
    throw new Error('Failed to list commissions');
  }

  // Форматируем ответ
  return commissions?.map((commission: any) => ({
    id: commission.id,
    manager_id: commission.manager_user_id,
    manager_name: commission.manager?.full_name || 'Unknown',
    order_id: commission.order_id,
    order_title: commission.order?.title || 'Unknown',
    amount: commission.amount,
    tx_status: commission.tx_status,
    created_at: commission.created_at,
    paid_at: commission.paid_at,
  })) || [];
}

export async function markAsPaid(commissionId: string) {
  const { data: commission, error: fetchError } = await supabase
    .from('commission_transactions')
    .select('*')
    .eq('id', commissionId)
    .single();

  if (fetchError || !commission) {
    throw new NotFoundError('Commission not found');
  }

  if (commission.tx_status === 'paid') {
    throw new Error('Commission already paid');
  }

  const { error } = await supabase
    .from('commission_transactions')
    .update({
      tx_status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', commissionId);

  if (error) {
    logger.error({ error, commissionId }, 'Failed to mark commission as paid');
    throw new Error('Failed to mark commission as paid');
  }
}

export async function getManagerBalance(managerUserId: string) {
  const { data: profile, error } = await supabase
    .from('manager_profiles')
    .select('*')
    .eq('user_id', managerUserId)
    .single();

  if (error || !profile) {
    throw new NotFoundError('Manager profile not found');
  }

  return {
    id: profile.id,
    user_id: profile.user_id,
    full_name: profile.full_name,
    balance_reserved: profile.balance_reserved || 0,
    balance_payable: profile.balance_payable || 0,
    balance_paid: profile.balance_paid || 0,
  };
}
