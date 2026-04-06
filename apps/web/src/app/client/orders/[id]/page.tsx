import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BriefSection } from '@/app/manager/orders/[id]/BriefSection'
import ChatWindow from '@/components/chat/ChatWindow'
import { StatusBadge } from '@/components/StatusBadge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import { OrderTitleSaver } from './OrderTitleSaver'
import BriefChat from '@/app/manager/orders/[id]/BriefChat'
import { ProjectInfoPanel } from '@/components/ProjectInfoPanel'
import OrderRealtimeSubscription from './OrderRealtimeSubscription'
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

async function hasAiChatHistory(orderId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ai_chat_messages')
    .select('id')
    .eq('order_id', orderId)
    .limit(1)
    .single()
  return !!data
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
  const hasAiHistory = await hasAiChatHistory(params.id)

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

  const hasManager = !!order.manager_user_id
  const defaultAccordion = (!hasManager && !hasAiHistory) ? 'assistant' : undefined

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Realtime подписка на изменения заказа */}
      <OrderRealtimeSubscription orderId={order.id} />
      
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
        currentUserId={currentUser.id}
      />

      {/* // ============================================================
          // STEPS GUIDE
          // ============================================================ */}
      <div className="border border-border rounded-lg overflow-hidden bg-card mb-4">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            последовательность работы
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-sky-500 font-mono font-bold">1</div>
            <span className="text-muted-foreground font-mono">Расскажите о проекте</span>
            <span className="text-sky-500 font-mono">[Ассистент]</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#dcb67a]/20 border border-[#dcb67a]/50 flex items-center justify-center text-[#dcb67a] font-mono font-bold">2</div>
            <span className="text-muted-foreground font-mono">Информация собрана</span>
            <span className="text-[#dcb67a] font-mono">[О проекте]</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-500 font-mono font-bold">3</div>
            <span className="text-muted-foreground font-mono">Общение с командой</span>
            <span className="text-green-500 font-mono">[Чат с командой]</span>
          </div>
        </div>
      </div>

      {/* // ============================================================
          // AI ASSISTANT SECTION (STEP 1)
          // ============================================================ */}
      <Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow mb-4" defaultValue={[defaultAccordion]}>
        <AccordionItem value="assistant">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                  <span className="text-sky-500">&gt;&gt;&gt;</span> Ассистент <span className="text-sky-500">&lt;&lt;&lt;</span>
                </h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-500 font-mono">онлайн</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-1 max-w-xl">Опишите свой бизнес и с какой проблемой пришли — ассистент задаст уточняющие вопросы и соберёт информацию для детальной диагностики вашего проекта.</p>
            </div>
            <div className="w-8 h-8 rounded border border-sky-500/50 flex items-center justify-center bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors data-[state=open]:rotate-180">
              <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0">
            {!hasManager && !hasAiHistory && (
              <div className="px-4 py-3 bg-sky-500/10 border-b border-sky-500/20">
                <p className="text-sm text-sky-400 font-mono">
                  💡 Расскажите о вашем проекте — ассистент поможет собрать информацию
                </p>
              </div>
            )}
            <BriefChat orderId={order.id} userRole="client" />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* // ============================================================
          // BRIEF SECTION (STEP 2)
          // ============================================================ */}
      <Accordion className="border border-border rounded-lg overflow-visible bg-card terminal-glow mb-4" defaultValue={[defaultAccordion]}>
        <AccordionItem value="brief">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                <span className="text-[#dcb67a]">&gt;&gt;&gt;</span> О проекте <span className="text-[#dcb67a]">&lt;&lt;&lt;</span>
              </h2>
              <p className="text-sm text-muted-foreground font-mono mt-1 max-w-xl">Здесь собрана структурированная информация по вашему проекту на основе диалога с ассистентом — это основа для нашего анализа.</p>
            </div>
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
          // CHAT SECTION (STEP 3)
          // ============================================================ */}
      <Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
        <AccordionItem value="chat-team">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                <span className="text-green-500">&gt;&gt;&gt;</span> Чат с командой <span className="text-green-500">&lt;&lt;&lt;</span>
              </h2>
              <p className="text-sm text-muted-foreground font-mono mt-1 max-w-xl">После изучения вашего проекта команда выйдет на связь — здесь будет проходить всё дальнейшее общение по проекту.</p>
            </div>
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
