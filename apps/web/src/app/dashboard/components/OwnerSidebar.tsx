'use client'

import { SidebarFolder } from '@/components/SidebarFolder'
import { SidebarFile } from '@/components/SidebarFile'

export function OwnerSidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 py-2 font-semibold">
        Explorer
      </div>

      <div className="flex flex-col gap-1 px-1">
        <SidebarFolder name="Заявки" defaultOpen={true}>
          <SidebarFile filename="all-orders.ts" href="/dashboard" />
          <SidebarFile filename="new-order.ts" href="/dashboard/orders/new" />
        </SidebarFolder>

        <SidebarFolder name="Комиссии" defaultOpen={false}>
          <SidebarFile filename="commissions.ts" href="/dashboard/commissions" />
        </SidebarFolder>

        <SidebarFolder name="Аналитика" defaultOpen={false}>
          <SidebarFile filename="revenue.ts" href="/dashboard/analytics" />
        </SidebarFolder>

        <SidebarFolder name="Выводы" defaultOpen={false}>
          <SidebarFile filename="withdrawals.ts" href="/dashboard/withdrawals" />
        </SidebarFolder>

        <SidebarFolder name="Настройки" defaultOpen={false}>
          <SidebarFile filename="profile.ts" href="/dashboard/profile" />
          <SidebarFile filename="industries.ts" href="/dashboard/industries" />
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
