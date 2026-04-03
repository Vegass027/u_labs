'use client'

import { SidebarFolder } from './SidebarFolder'
import { SidebarFile } from './SidebarFile'

export function VSCodeSidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 py-2 font-semibold">
        Explorer
      </div>

      <div className="flex flex-col gap-1 px-1">
        <SidebarFolder name="Заявки" defaultOpen={true}>
          <SidebarFile filename="мои заявки.ts" href="/manager" />
          <SidebarFile filename="создать заявку.ts" href="/manager/orders/new" />
        </SidebarFolder>

        <SidebarFolder name="Баланс" defaultOpen={false}>
          <SidebarFile filename="balance.ts" href="/manager/balance" />
        </SidebarFolder>

        <SidebarFolder name="Настройки" defaultOpen={false}>
          <SidebarFile filename="profile.ts" href="/manager/profile" />
        </SidebarFolder>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 py-2 font-semibold">
          Outline
        </div>
        <div className="px-3 py-2 text-xs text-muted-foreground/60 font-mono">
          No symbols found
        </div>
      </div>
    </div>
  )
}
