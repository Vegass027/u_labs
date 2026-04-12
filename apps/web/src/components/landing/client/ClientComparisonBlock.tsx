'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const comparisons = [
  { param: "Начало работы", typical: "2-4 недели", ours: "2 часа на КП" },
  { param: "Техническое задание", typical: "Пишете сами", ours: "Собираем вместе" },
  { param: "Цена", typical: "Меняется в процессе", ours: "Фиксированная" },
  { param: "Статус проекта", typical: "«Звоните, узнавайте»", ours: "Личный кабинет" },
  { param: "Общение", typical: "Email, потеряется", ours: "Чат в системе" },
  { param: "Срок", typical: "«Примерно»", ours: "Конкретная дата" },
  { param: "После сдачи", typical: "Исчезают", ours: "Поддержка" },
]

const ClientComparisonBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/compare — чем отличаемся">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// мы — не типичный подрядчик</div>

              <div className="h-2" />

              {/* Comparison table */}
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-3 px-3 py-2 bg-muted/30 border-b border-border text-xs uppercase tracking-wider font-mono">
                  <span className="text-muted-foreground">параметр</span>
                  <span className="text-center text-destructive/70">подрядчик</span>
                  <span className="text-right text-primary">мы</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border">
                  {comparisons.map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="grid grid-cols-3 px-3 py-2.5 text-xs hover:bg-muted/20 transition-colors"
                    >
                      <span className="text-foreground">{row.param}</span>
                      <span className="text-center text-muted-foreground">
                        <span className="text-destructive/60 mr-1">✗</span>
                        {row.typical}
                      </span>
                      <span className="text-right text-primary">
                        <span className="mr-1">✓</span>
                        {row.ours}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ClientComparisonBlock
