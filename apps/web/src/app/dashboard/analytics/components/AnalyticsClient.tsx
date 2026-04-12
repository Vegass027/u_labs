'use client'

import dynamic from 'next/dynamic'
import type { RevenueAnalytics } from '@agency/types'

const RevenueChart = dynamic(
  () => import('./RevenueChart').then(mod => ({ default: mod.RevenueChart })),
  { ssr: false }
)

function formatMoney(value: number): string {
  return value.toLocaleString('ru-RU')
}

function getOrdersWord(count: number): string {
  if (count === 1) return 'заказ'
  if (count > 1 && count < 5) return 'заказа'
  return 'заказов'
}

interface StatCardProps {
  label: string
  value: number
  count: number
  colorClass: string
  commentLabel: string
}

function StatCard({ label, value, count, colorClass, commentLabel }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-all">
      <div className="text-xs font-mono text-terminal-comment mb-2">{commentLabel}</div>
      <div className={`text-2xl font-bold ${colorClass} mb-1`}>
        {formatMoney(value)} ₽
      </div>
      <div className="text-xs text-muted-foreground">
        {count} {getOrdersWord(count)}
      </div>
    </div>
  )
}

interface MonthlyBarProps {
  month: string
  total: number
  ownerDirect: number
  viaManagers: number
  selfClients: number
  maxTotal: number
}

function formatMonthRu(month: string): string {
  const [year, m] = month.split('-')
  const months: Record<string, string> = {
    '01': 'Январь', '02': 'Февраль', '03': 'Март', '04': 'Апрель',
    '05': 'Май', '06': 'Июнь', '07': 'Июль', '08': 'Август',
    '09': 'Сентябрь', '10': 'Октябрь', '11': 'Ноябрь', '12': 'Декабрь',
  }
  return `${months[m] || m} ${year}`
}

function MonthlyBar({ month, total, ownerDirect, viaManagers, selfClients, maxTotal }: MonthlyBarProps) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0
  const ownerPct = total > 0 ? (ownerDirect / total) * 100 : 0
  const managersPct = total > 0 ? (viaManagers / total) * 100 : 0
  const clientsPct = total > 0 ? (selfClients / total) * 100 : 0

  return (
    <div className="flex items-center gap-4 group">
      <span className="text-xs font-mono text-muted-foreground w-28 shrink-0">
        {formatMonthRu(month)}
      </span>
      <div className="flex-1">
        <div className="bg-primary/5 rounded-full h-7 overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-700 flex"
            style={{ width: `${pct}%` }}
          >
            <div className="bg-[#4ade80]/60 h-full" style={{ width: `${ownerPct}%` }} />
            <div className="bg-[#fbbf24]/60 h-full" style={{ width: `${managersPct}%` }} />
            <div className="bg-[#22d3ee]/60 h-full" style={{ width: `${clientsPct}%` }} />
          </div>
        </div>
      </div>
      <span className="text-sm font-mono text-primary w-36 text-right shrink-0">
        {formatMoney(total)} ₽
      </span>
    </div>
  )
}

interface AnalyticsClientProps {
  analytics: RevenueAnalytics
}

export function AnalyticsClient({ analytics }: AnalyticsClientProps) {
  const { all_time: allTime, monthly } = analytics
  const maxMonthlyTotal = Math.max(...monthly.map(m => m.total), 1)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg text-foreground font-mono">
          <span className="font-bold">// Аналитика // -&gt;</span>{' '}
          <span className="text-[#dcb67a]">Доходы агентства:</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-all">
          <div className="text-xs font-mono text-terminal-comment mb-2">// Общий доход</div>
          <div className="text-2xl font-bold text-primary mb-1">
            {formatMoney(allTime.total_revenue)} ₽
          </div>
          <div className="text-xs text-muted-foreground">
            {allTime.total_orders} {getOrdersWord(allTime.total_orders)}
          </div>
        </div>

        <StatCard
          label="Личные"
          value={allTime.owner_direct.total_revenue}
          count={allTime.owner_direct.orders_count}
          colorClass="text-[#4ade80]"
          commentLabel="// Личные заказы (owner)"
        />

        <StatCard
          label="Менеджеры"
          value={allTime.via_managers.total_revenue}
          count={allTime.via_managers.orders_count}
          colorClass="text-[#fbbf24]"
          commentLabel="// Через менеджеров"
        />

        <StatCard
          label="Клиенты"
          value={allTime.self_clients.total_revenue}
          count={allTime.self_clients.orders_count}
          colorClass="text-[#22d3ee]"
          commentLabel="// Самостоятельные клиенты"
        />
      </div>

      {/* Chart section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-xs font-mono text-terminal-comment mb-4">
          // График доходов за всё время
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
            <span className="text-xs font-mono text-muted-foreground">Личные заказы</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
            <span className="text-xs font-mono text-muted-foreground">Через менеджеров</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22d3ee]" />
            <span className="text-xs font-mono text-muted-foreground">Самостоятельные</span>
          </div>
        </div>

        <RevenueChart data={monthly} />
      </div>

      {/* Monthly progress bars */}
      {monthly.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-xs font-mono text-terminal-comment mb-6">
            // Помесячная статистика
          </div>
          <div className="space-y-3">
            {[...monthly].reverse().map(m => (
              <MonthlyBar
                key={m.month}
                month={m.month}
                total={m.total}
                ownerDirect={m.owner_direct}
                viaManagers={m.via_managers}
                selfClients={m.self_clients}
                maxTotal={maxMonthlyTotal}
              />
            ))}
          </div>
        </div>
      )}

      {monthly.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-muted-foreground text-xs font-mono">
            <div className="text-terminal-comment mb-2">// данных пока нет</div>
            <div>// завершённые заказы с ценой появятся в аналитике</div>
          </div>
        </div>
      )}
    </div>
  )
}
