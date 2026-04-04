import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/app/dashboard/components/StatusBadge'
import { RawTextEditor } from '@/components/RawTextEditor'
import { SetPriceForm } from './SetPriceForm'
import { UpdateStatusForm } from './UpdateStatusForm'
import { DocumentsSection } from './DocumentsSection'
import ChatWindow from '@/components/chat/ChatWindow'
import Link from 'next/link'
import type { Order } from '@agency/types'
import type { Document } from '@/app/manager/components/DocumentList'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'

async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:users!orders_client_user_id_fkey (
        full_name,
        email,
        phone
      ),
      manager:users!orders_manager_user_id_fkey (
        full_name,
        email
      )
    `)
    .eq('id', orderId)
    .single()
  
  if (error) {
    console.error('Failed to fetch order:', error)
    return null
  }
  
  return data
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return {
    id: user.id,
    role: userData?.role || 'client'
  }
}

async function getOrderDocuments(orderId: string): Promise<Document[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const { data: { session } } = await supabase.auth.getSession()
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/documents`,
      {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        cache: 'no-store',
      }
    )
    
    if (!response.ok) return []
    
    return await response.json() || []
  } catch {
    return []
  }
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)
  const currentUser = await getCurrentUser()
  const documents = await getOrderDocuments(params.id)
  
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="border border-red-500/30 rounded-lg p-6 bg-card">
          <div className="text-red-400 font-mono font-bold text-lg mb-2">[error]</div>
          <div className="text-muted-foreground">заказ не найден</div>
        </div>
      </div>
    )
  }
  
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="border border-red-500/30 rounded-lg p-6 bg-card">
          <div className="text-red-400 font-mono font-bold text-lg mb-2">[error]</div>
          <div className="text-muted-foreground">необходимо авторизоваться</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Back link with order header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
        >
          <span className="text-green-500 text-lg">{'<<<'}</span>
          <span className="text-lg font-semibold">Все заявки</span>
        </Link>
        <span className="text-[#dcb67a]">𖣔</span>
        <div className="border border-border rounded-lg bg-card flex-1">
          <div className="px-4 py-2 border-b border-border bg-muted/50">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-foreground font-mono">{order.title}</h1>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <span className="text-primary">created_at:</span>
              <span>[{new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}]</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Client & Manager Info */}
      <div className="grid grid-cols-2 gap-4">
        {/* Client Information */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              <span className="text-[#dcb67a]">{'>>>'}</span> Клиент
            </h2>
          </div>
          <div className="p-4 space-y-3 text-sm font-mono">
            <div className="flex items-center gap-2">
              <span className="text-primary w-24">name:</span>
              <span className="text-foreground">{'{' + (order.client?.full_name || 'Unknown') + '}'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary w-24">email:</span>
              <span className="text-foreground">{'{' + (order.client?.email || 'Unknown') + '}'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary w-24">phone:</span>
              <span className="text-foreground">{'{' + (order.client?.phone || '—') + '}'}</span>
            </div>
          </div>
        </div>
        
        {/* Manager Information */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              <span className="text-[#dcb67a]">{'>>>'}</span> Менеджер
            </h2>
          </div>
          <div className="p-4 space-y-3 text-sm font-mono">
            <div className="flex items-center gap-2">
              <span className="text-primary w-24">name:</span>
              <span className="text-foreground">{'{' + (order.manager?.full_name || 'Unassigned') + '}'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary w-24">email:</span>
              <span className="text-foreground">{'{' + (order.manager?.email || '—') + '}'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Details */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            <span className="text-[#dcb67a]">{'>>>'}</span> Детали заявки
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-primary w-32">price:</span>
              <span className="text-foreground font-semibold">
                {order.price ? `${order.price.toLocaleString('ru-RU')} ₽` : '// not set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-primary w-32">commission:</span>
              <span className="text-foreground font-semibold">
                {order.manager_commission ? `${order.manager_commission.toLocaleString('ru-RU')} ₽` : '// —'}
              </span>
            </div>
          </div>
          
          {order.rejection_reason && (
            <div>
              <h3 className="text-sm font-bold text-foreground font-mono mb-2">
                <span className="text-red-400">//</span> Rejection Reason:
              </h3>
              <div className="p-4 bg-red-50/50 border border-red-500/30 rounded-md text-sm font-mono">
                {order.rejection_reason}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="border border-border rounded-lg overflow-visible bg-card relative z-50">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            <span className="text-[#dcb67a]">{'>>>'}</span> Действия
          </h2>
        </div>
        <div className="p-4 space-y-6">
          {/* Set Price & Update Status */}
          <div className="flex gap-4">
            <SetPriceForm orderId={order.id} currentPrice={order.price} />
            <UpdateStatusForm orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Documents Section */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-bold text-foreground font-mono mb-4">
              <span className="text-[#dcb67a]">{'>>>'}</span> Документы
            </h3>
            <DocumentsSection
              orderId={order.id}
              initialDocuments={documents}
            />
          </div>
        </div>
      </div>
      
      {/* Brief */}
      <Accordion className="border border-border rounded-lg overflow-visible bg-card terminal-glow">
        <AccordionItem value="brief">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              <span className="text-[#dcb67a]">{'>>>'}</span> Бриф <span className="text-[#dcb67a]">{'<<<'}</span>
            </h2>
            <div className="w-8 h-8 rounded border border-[#dcb67a]/50 flex items-center justify-center bg-[#dcb67a]/10 group-hover:bg-[#dcb67a]/20 transition-colors data-[state=open]:rotate-180">
              <svg className="w-4 h-4 text-[#dcb67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0 overflow-visible">
            <div className="p-4">
              <RawTextEditor orderId={order.id} initialText={order.raw_text} />
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* Chat */}
      <Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
        <AccordionItem value="chat">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              <span className="text-green-500">{'>>>'}</span> Чат <span className="text-green-500">{'<<<'}</span>
            </h2>
            <div className="w-8 h-8 rounded border border-green-500/50 flex items-center justify-center bg-green-500/10 group-hover:bg-green-500/20 transition-colors data-[state=open]:rotate-180">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0">
            <div className="h-96">
              <ChatWindow orderId={order.id} currentUserId={currentUser.id} currentUserRole={currentUser.role} />
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
