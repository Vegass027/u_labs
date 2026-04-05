'use client'

import { SidebarFolder } from '@/components/terminal/SidebarFolder'
import { SidebarFile } from '@/components/terminal/SidebarFile'

export function ClientSidebar() {
  return (
    <div className="flex flex-col gap-2">
      {/* Explorer Section */}
      <div className="px-3 py-2 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
        explorer
      </div>

      {/* Заявки Folder */}
      <SidebarFolder name="Заявки" defaultOpen={true}>
        <SidebarFile filename="мои заявки.ts" href="/client" />
        <SidebarFile filename="создать заявку.ts" href="/client/orders/new" />
      </SidebarFolder>

      {/* Настройки Folder */}
      <SidebarFolder name="Настройки" defaultOpen={false}>
        <SidebarFile filename="profile.ts" href="/client/profile" />
      </SidebarFolder>

      {/* Outline Section */}
      <div className="px-3 py-2 text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-4">
        outline
      </div>
    </div>
  )
}
