'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const cases = [
  {
    title: "Автосервис на 3 мастера",
    problem: "Принимает заявки в WhatsApp вручную",
    loss: "15-20% клиентов не дождались ответа",
    money: "~150 000 ₽/мес в никуда",
    icon: "🔧",
  },
  {
    title: "Малый ритейл",
    problem: "Учёт в Excel, остатки на глаз",
    loss: "Перезакупы и дефициты каждый месяц",
    money: "Замороженные деньги в товаре",
    icon: "📦",
  },
  {
    title: "Услуговая компания",
    problem: "Менеджеры тратят 2-3 часа/день на отчёты",
    loss: "40+ часов в месяц на ручную работу",
    money: "Зарплата за работу которую делает Excel",
    icon: "📋",
  },
]

const ManagerScaleBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/analytics — сколько стоит «и так сойдёт»">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// реальные потери бизнеса — каждый день</div>

              <div className="h-2" />

              {/* Three dashboard cards */}
              <div className="space-y-3">
                {cases.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors group"
                  >
                    {/* Card header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-foreground font-medium">{c.title}</span>
                    </div>

                    {/* Problem description */}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0">→</span>
                        <span className="text-muted-foreground">{c.problem}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive shrink-0">✗</span>
                        <span className="text-foreground">{c.loss}</span>
                      </div>
                    </div>

                    {/* Money loss — styled like a dashboard metric */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">потери</span>
                        <span className="text-sm text-destructive font-mono font-medium">{c.money}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="h-2" />

              {/* Conclusion */}
              <div className="border-t border-border pt-3">
                <div className="flex items-start gap-2">
                  <span className="text-primary shrink-0">→</span>
                  <span className="text-foreground">
                    Они не ищут помощи — потому что не знают что решение <span className="text-primary text-glow-sm">существует.</span>
                  </span>
                </div>
                <div className="flex items-start gap-2 mt-1">
                  <span className="text-primary shrink-0">→</span>
                  <span className="text-foreground">
                    Вы можете им это показать.
                  </span>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ManagerScaleBlock
