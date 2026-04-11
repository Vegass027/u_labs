import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from './components/ClientSidebar'
import { ClientTabManager } from './components/ClientTabManager'
import { TabProvider } from '@/components/terminal/TabContext'
import { MainContent } from '@/components/terminal/MainContent'
import ClientHeader from './components/ClientHeader'
import { PasswordGate } from '@/components/PasswordGate'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // КРИТИЧЕСКАЯ ЛОГИКА: Автопривязка заказов
  if (user) {
    await supabase
      .from('orders')
      .update({ client_user_id: user.id })
      .eq('client_contact', user.email)
      .is('client_user_id', null)
  }

  // Получаем данные профиля пользователя
  const { data: userData } = await supabase
    .from('users')
    .select('id, full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background grid of small squares */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(45deg, hsl(155 100% 50%) 25%, transparent 25%),
          linear-gradient(-45deg, hsl(155 100% 50%) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, hsl(155 100% 50%) 75%),
          linear-gradient(-45deg, transparent 75%, hsl(155 100% 50%) 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }} />

      {/* Terminal window container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header bar */}
        <header className="flex items-center gap-2 px-4 py-2.5 bg-terminal-header border-b border-border sticky top-0 z-50">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(0 70% 55%)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(40 80% 55%)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(120 60% 45%)" }} />
          </div>
          
          {/* Title */}
          <span className="font-mono text-xs text-muted-foreground ml-2">
            ~/client-dashboard — панель клиента
          </span>

          {/* Right side actions */}
          <div className="ml-auto">
            <ClientHeader
              currentUserId={user.id}
              userName={userData?.full_name || 'Client'}
              userEmail={userData?.email || ''}
              avatarUrl={userData?.avatar_url}
            />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* VSCode-style Sidebar with transparent background */}
          <aside className="w-64 border-r border-border bg-card/50 flex flex-col overflow-y-auto">
            <ClientSidebar />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TabProvider>
              {/* Tab bar */}
              <div className="flex-shrink-0 border-b border-border bg-card/50">
                <ClientTabManager />
              </div>

              {/* Main content */}
              <main className="flex-1 p-6 font-mono text-sm overflow-auto">
                <MainContent>
                  {children}
                </MainContent>
              </main>
            </TabProvider>
          </div>
        </div>
      </div>

      {/* КРИТИЧЕСКАЯ ЛОГИКА: PasswordGate */}
      <PasswordGate />
    </div>
  )
}
