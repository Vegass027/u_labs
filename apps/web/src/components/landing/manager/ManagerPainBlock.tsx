'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const ManagerPainBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/diagnostics — вы знаете людей у которых есть бизнес">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// пока вы это читаете — бизнес теряет деньги</div>

              <div className="h-2" />

              {/* Error console — боли бизнеса */}
              <div className="space-y-2">
                {[
                  { icon: "⚠", text: "Автосервис на 3 мастера — принимает заявки в WhatsApp вручную" },
                  { icon: "⚠", text: "Ритейл — учёт в Excel, остатки на глаз" },
                  { icon: "⚠", text: "Услуги — менеджеры тратят 2-3 часа в день на отчёты" },
                ].map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-terminal-string shrink-0">{line.icon}</span>
                    <span className="text-foreground">{line.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="h-3" />

              {/* System dashboard mockup — потери */}
              <div className="border border-destructive/30 rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-destructive uppercase tracking-wider font-mono">потери за сегодня</span>
                  <span className="text-xs text-muted-foreground font-mono">обновлено только что</span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl font-bold text-destructive font-mono"
                >
                  ~150 000 ₽
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">уходит в никуда — каждый день</div>
              </div>

              <div className="h-2" />

              {/* Вывод */}
              <div className="border-t border-border pt-3">
                <div className="flex items-start gap-2">
                  <span className="text-primary shrink-0">→</span>
                  <span className="text-foreground">
                    Они жалуются на хаос, потери, ручную работу.
                  </span>
                </div>
                <div className="flex items-start gap-2 mt-1">
                  <span className="text-primary shrink-0">→</span>
                  <span className="text-foreground">
                    И <span className="text-primary text-glow-sm">никто им не предлагает решение.</span>
                  </span>
                </div>
              </div>

              <div className="h-2" />

              {/* Blinking cursor */}
              <div className="flex items-center gap-2">
                <span className="text-terminal-prompt">$</span>
                <span className="text-muted-foreground">каждый день промедления = потерянные деньги</span>
                <span className="w-2 h-5 bg-primary animate-blink inline-block" />
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ManagerPainBlock
