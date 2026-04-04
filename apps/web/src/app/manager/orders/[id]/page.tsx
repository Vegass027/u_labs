import { createClient } from '@/lib/supabase/server'
import { BriefSection } from './BriefSection'
import BriefChat from './BriefChat'
import OrderChatInput from './OrderChatInput'
import { ManagerStatusDropdown } from './ManagerStatusDropdown'
import { ProjectInfoPanel } from './ProjectInfoPanel'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import Link from 'next/link'
import { OrderTitleSaver } from './OrderTitleSaver'
import { unstable_noStore as noStore } from 'next/cache'
import type { Document } from '@/app/manager/components/DocumentList'

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

export default async function ManagerOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  noStore()
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single()

  const documents = await getOrderDocuments(params.id)

  if (error || !order) {
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
      {/* Save order title for tabs */}
      <OrderTitleSaver orderId={order.id} title={order.title} />

      {/* Back link with order header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
        <Link
          href="/manager"
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
                <ManagerStatusDropdown orderId={order.id} currentStatus={order.manager_status} />
              </div>
          </div>
          {order.client_user_id && (
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <span className="text-primary">client_id:</span>
                <span>{order.client_user_id}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Project Info Panel */}
      <ProjectInfoPanel
        price={order.price}
        documents={documents}
        orderId={order.id}
      />
      
      {/* Brief */}
      <Accordion className="border border-border rounded-lg overflow-visible bg-card terminal-glow">
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
                brief={order.structured_brief}
                rawText={order.raw_text}
              />
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* Transcript */}
      {order.transcript && (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
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

      {/* Audio */}
      {order.audio_url && (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
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

      {/* Chat */}
      <Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
        <AccordionItem value="chat">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              <span className="text-green-500">&gt;&gt;&gt;</span> Чат с клиентом <span className="text-green-500">&lt;&lt;&lt;</span>
            </h2>
            <div className="w-8 h-8 rounded border border-green-500/50 flex items-center justify-center bg-green-500/10 group-hover:bg-green-500/20 transition-colors data-[state=open]:rotate-180">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-transparent">
              <div className="flex items-center justify-center h-full text-muted-foreground font-mono">
                сообщений пока нет. начните общение.
              </div>
            </div>
            <OrderChatInput />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* Brief Chat with AI */}
      <Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
        <AccordionItem value="brief-chat">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono">онлайн</span>
              </div>
              <span className="text-sky-400">&gt;&gt;&gt;</span>
              Чат с Брифером <span className="text-sky-400">&lt;&lt;&lt;</span>
            </h2>
            <div className="w-8 h-8 rounded border border-sky-400/50 flex items-center justify-center bg-sky-400/10 group-hover:bg-sky-400/20 transition-colors data-[state=open]:rotate-180">
              <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0">
            <BriefChat orderId={order.id} />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
