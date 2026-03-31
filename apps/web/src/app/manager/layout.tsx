import { createClient } from '@/lib/supabase/server'
import NotificationBell from '@/components/NotificationBell'
import { LogoutButton } from '@/components/LogoutButton'
import { VSCodeSidebar } from './components/VSCodeSidebar'
import { TabManager } from './components/TabManager'
import { TabProvider } from './components/TabContext'
import { MainContent } from './components/MainContent'

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(155 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(155 100% 50%) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
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
            ~/manager-dashboard — панель менеджера
          </span>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell currentUserId={user.id} />
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-card border border-border">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-[10px] text-primary font-mono">
                {userData?.full_name?.[0] || 'M'}
              </div>
              <div className="text-xs">
                <p className="text-foreground font-medium">{userData?.full_name || 'Manager'}</p>
                <p className="text-muted-foreground text-[10px]">{userData?.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="flex flex-1">
          {/* VSCode-style Sidebar with transparent background */}
          <aside className="w-64 border-r border-border bg-card/50 flex flex-col sticky top-[45px] h-[calc(100vh-45px)]">
            <VSCodeSidebar />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            <TabProvider>
              {/* Tab bar */}
              <TabManager />

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
    </div>
  )
}
