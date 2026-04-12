'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyRevenue } from '@agency/types'

interface RevenueChartProps {
  data: MonthlyRevenue[]
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const months: Record<string, string> = {
    '01': 'Янв', '02': 'Фев', '03': 'Мар', '04': 'Апр',
    '05': 'Май', '06': 'Июн', '07': 'Июл', '08': 'Авг',
    '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек',
  }
  return `${months[m] || m} ${year.slice(2)}`
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}М`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}К`
  return value.toString()
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg font-mono text-xs">
      <p className="text-[#dcb67a] mb-2 font-semibold">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="text-foreground font-medium">
            {entry.value.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground text-xs font-mono py-12 text-center">
        <div className="text-terminal-comment mb-2">// нет данных для графика</div>
        <div>// завершённые заказы с ценой появятся здесь</div>
      </div>
    )
  }

  const chartData = data.map(m => ({
    ...m,
    monthLabel: formatMonth(m.month),
  }))

  return (
    <div className="w-full" style={{ height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradOwner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradManagers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradClients" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 15%)" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: 'hsl(220 10% 40%)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'hsl(220 10% 15%)' }}
            tickLine={{ stroke: 'hsl(220 10% 15%)' }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: 'hsl(220 10% 40%)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'hsl(220 10% 15%)' }}
            tickLine={{ stroke: 'hsl(220 10% 15%)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="owner_direct"
            name="Личные заказы"
            stroke="#4ade80"
            fillOpacity={1}
            fill="url(#gradOwner)"
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="via_managers"
            name="Через менеджеров"
            stroke="#fbbf24"
            fillOpacity={1}
            fill="url(#gradManagers)"
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="self_clients"
            name="Самостоятельные"
            stroke="#22d3ee"
            fillOpacity={1}
            fill="url(#gradClients)"
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
