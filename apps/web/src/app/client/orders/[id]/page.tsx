import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BriefSection } from '@/app/manager/orders/[id]/BriefSection'
import ChatWindow from '@/components/chat/ChatWindow'
import { StatusBadge } from '@/components/StatusBadge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import { OrderTitleSaver } from './OrderTitleSaver'
import BriefChat from '@/app/manager/orders/[id]/BriefChat'
import { ProjectInfoPanel } from '@/components/ProjectInfoPanel'
import type { Order } from '@agency/types'
import type { Document } from '@/components/DocumentList'

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

async function getOrder(orderId: string, userId: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('client_user_id', userId)
    .single()

  if (error) {
    return null
  }

  return data
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

export default async function ClientOrderDetailPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 font-mono">
          <h1 className="text-xl font-semibold text-red-400 mb-2">// Ошибка</h1>
          <p className="text-red-300">Необходимо авторизоваться</p>
        </div>
      </div>
    )
  }

  const order = await getOrder(params.id, currentUser.id)
  const documents = await getOrderDocuments(params.id)

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 font-mono">
          <h1 className="text-xl font-semibold text-red-400 mb-2">// Ошибка</h1>
          <p className="text-red-300">Заказ не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Save order title for tabs */}
      <OrderTitleSaver orderId={order.id} title={order.title} />
      
      {/* // ============================================================
          // NAVIGATION WITH ORDER HEADER
          // ============================================================ */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
        <Link
          href="/client"
          className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
        >
          <span className="text-green-500 text-lg">&lt;&lt;&lt;</span>
          <span className="text-lg font-semibold">Мои заявки</span>
        </Link>
        <span className="text-[#dcb67a]">𖣔</span>
        <div className="border border-border rounded-lg bg-card flex-1">
          <div className="px-4 py-2 border-b border-border bg-muted/50">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-foreground font-mono">{order.title}</h1>
                <StatusBadge status={order.status} />
              </div>
          </div>
        </div>
      </div>

      {/* // ============================================================
          // PROJECT INFO PANEL
          // ============================================================ */}
      <ProjectInfoPanel
        price={order.price ?? null}
        documents={documents}
        orderId={order.id}
      />

      {/* // ============================================================
          // BRIEF SECTION
          // ============================================================ */}
      <Accordion className="border border-border rounded-lg overflow-visible bg-card terminal-glow mb-4">
        <AccordionItem value="brief">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              <span className="text-[#dcb67a]">&gt;&gt;&gt;</span> Бриф <span className="text-[#dcb67a]">&lt;&lt;&lt;</span>
            </h2>
            <div className="w-8 h-8 rounded border border-[#dcb67a]/50 flex items-center justify-center bg-[#dcb67a]/10 group-hover:bg-[#dcb67a]/20 transition-colors data-[state=open]:rotate-180">
              <svg className="w-4 h-4 text-[#dcb67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0 overflow-visible">
            <div className="p-4">
              <BriefSection
                orderId={order.id}
                brief={order.structured_brief ?? null}
                rawText={order.raw_text ?? null}
                apiEndpoint="/api/orders"
              />
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      {/* // ============================================================
          // TRANSCRIPT SECTION
          // ============================================================ */}
      {order.transcript && (
        <div className="border border-border rounded-lg overflow-hidden bg-card mb-4">
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              транскрипция
            </h2>
          </div>
          <div className="p-4">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
              {order.transcript}
            </pre>
          </div>
        </div>
      )}

      {/* // ============================================================
          // AUDIO SECTION
          // ============================================================ */}
      {order.audio_url && (
        <div className="border border-border rounded-lg overflow-hidden bg-card mb-4">
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              аудиофайл
            </h2>
          </div>
          <div className="p-4">
            <audio controls className="w-full">
              <source src={order.audio_url} type="audio/ogg" />
              ваш браузер не поддерживает аудио
            </audio>
          </div>
        </div>
      )}

      {/* // ============================================================
          // AI ASSISTANT SECTION
          // ============================================================ */}
      <Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow mb-4">
        <AccordionItem value="chat-ai">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono">онлайн</span>
              </div>
              <span className="text-sky-500">&gt;&gt;&gt;</span> Чат с Брифером <span className="text-sky-500">&lt;&lt;&lt;</span>
            </h2>
            <div className="w-8 h-8 rounded border border-sky-500/50 flex items-center justify-center bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors data-[state=open]:rotate-180">
              <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0">
            <BriefChat orderId={order.id} />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* // ============================================================
          // CHAT SECTION
          // ============================================================ */}
      <Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
        <AccordionItem value="chat-manager">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              <span className="text-green-500">&gt;&gt;&gt;</span> Чат с менеджером <span className="text-green-500">&lt;&lt;&lt;</span>
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
