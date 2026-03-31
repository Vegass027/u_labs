import { createClient } from '@/lib/supabase/server'
import { BriefDisplay } from '@/components/BriefDisplay'
import { AudioUploadForm } from './AudioUploadForm'
import { TextStructureForm } from './TextStructureForm'
import ChatWindow from '@/components/chat/ChatWindow'
import Link from 'next/link'
import { StatusBadge } from '../../components/StatusBadge'

async function getCurrentUser() {
  const supabase = createClient()
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

export default async function ManagerOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const currentUser = await getCurrentUser()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single()

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
      {/* Back link */}
      <Link
        href="/manager"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
      >
        <span className="text-primary">←</span>
        к списку заявок
      </Link>

      {/* Order header */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground font-mono">{order.title}</h1>
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <span className="text-primary">id:</span>
            <span>{order.id}</span>
          </div>
          {order.created_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <span className="text-primary">created:</span>
              <span>{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {order.client_user_id && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <span className="text-primary">client_id:</span>
              <span>{order.client_user_id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Brief */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            бриф
          </h2>
        </div>
        <div className="p-4">
          <BriefDisplay brief={order.structured_brief} />
        </div>
      </div>

      {/* Forms grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <AudioUploadForm orderId={order.id} />
        <TextStructureForm orderId={order.id} />
      </div>

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
      <ChatWindow orderId={order.id} currentUserId={currentUser.id} currentUserRole={currentUser.role} />
    </div>
  )
}
