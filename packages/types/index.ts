// ============================================================
// Shared TypeScript Types
// ============================================================

// ------------------------------------------------------------
// User & Role
// ------------------------------------------------------------

export type UserRole = 'owner' | 'manager' | 'client'

export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string
  phone?: string | null
  telegram_chat_id?: string | null
  avatar_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------
// Order
// ------------------------------------------------------------

export type OrderStatus = 'new' | 'reviewing' | 'proposal_sent' | 'contract_signed' | 'in_development' | 'done' | 'rejected'

export interface StructuredBrief {
  pain: string | null
  current_process: string | null
  desired_result: string | null
  target_audience: string | null
  features: string[] | null
  integrations: string[] | null
  budget: string | null
  deadline: string | null
  tech_hints: string | null
  questions: string[] | null
  summary: string
}

export interface Order {
  id: string
  client_user_id?: string | null
  client_name?: string | null
  client_contact?: string | null
  manager_user_id?: string | null
  title: string
  status: OrderStatus
  price?: number | null
  manager_commission?: number | null
  raw_text?: string | null
  audio_url?: string | null
  transcript?: string | null
  structured_brief?: StructuredBrief | null
  rejection_reason?: string | null
  client?: User | null
  manager?: User | null
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------
// Manager Profile
// ------------------------------------------------------------
 
export interface ManagerProfile {
  id: string
  user_id: string
  balance_reserved: number
  balance_payable: number
  balance_paid: number
  total_orders: number
  sbp_phone?: string | null
  card_number?: string | null
  sbp_comment?: string | null
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------
// Commission Transaction
// ------------------------------------------------------------

export type CommissionStatus = 'reserved' | 'payable' | 'paid'

export interface CommissionTransaction {
  id: string
  order_id: string
  manager_user_id: string
  amount: number
  tx_status: CommissionStatus
  note?: string | null
  paid_at?: string | null
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------
// Order Message
// ------------------------------------------------------------

export interface OrderMessage {
  id: string
  order_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// ------------------------------------------------------------
// Notification
// ------------------------------------------------------------

export interface Notification {
  id: string
  user_id: string
  order_id?: string | null
  type: string
  title: string
  body?: string | null
  is_read: boolean
  created_at: string
}

// ------------------------------------------------------------
// Withdrawal Request
// ------------------------------------------------------------
 
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected'
 
export interface WithdrawalRequest {
  id: string
  manager_user_id: string
  amount: number
  status: WithdrawalStatus
  processed_at?: string | null
  created_at: string
  updated_at: string
  manager?: User | null
  manager_profile?: {
    sbp_phone?: string | null
    card_number?: string | null
    sbp_comment?: string | null
  } | null
}

// ------------------------------------------------------------
// Payment Details
// ------------------------------------------------------------
 
export interface PaymentDetails {
  sbp_phone?: string | null
  card_number?: string | null
  sbp_comment?: string | null
}
