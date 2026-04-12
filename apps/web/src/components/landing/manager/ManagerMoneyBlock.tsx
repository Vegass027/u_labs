'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const projects = [
  { type: "Telegram-бот", price: "30-60 тыс ₽", commission: "9-18 тыс ₽" },
  { type: "CRM под бизнес", price: "80-150 тыс ₽", commission: "24-45 тыс ₽" },
  { type: "Автоматизация процессов", price: "60-120 тыс ₽", commission: "18-36 тыс ₽" },
  { type: "Веб-приложение", price: "150-400 тыс ₽", commission: "45-120 тыс ₽" },
]

const ManagerMoneyBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/calculator — сколько стоит один разговор">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// ваша комиссия — 30% с каждого проекта</div>

              <div className="h-2" />

              {/* Table header */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 px-3 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-mono">
                  <span>тип проекта</span>
                  <span className="text-center">средний чек</span>
                  <span className="text-right">ваша комиссия</span>
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border">
                  {projects.map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="grid grid-cols-3 px-3 py-3 text-sm hover:bg-muted/20 transition-colors"
                    >
                      <span className="text-foreground">{row.type}</span>
                      <span className="text-center text-muted-foreground font-mono">{row.price}</span>
                      <span className="text-right text-primary font-mono font-medium">{row.commission}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="h-2" />

              {/* Highlight card */}
              <div className="border border-primary/20 rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">один клиент в месяц</span>
                </div>
                <div className="text-foreground text-sm">
                  Это уже больше чем <span className="text-primary text-glow-sm font-mono">средняя зарплата менеджера по продажам.</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
                  <span>без оклада</span>
                  <span className="text-border">·</span>
                  <span>без офиса</span>
                  <span className="text-border">·</span>
                  <span>без KPI</span>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ManagerMoneyBlock
