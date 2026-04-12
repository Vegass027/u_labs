'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const facts = [
  {
    num: "01",
    title: "Потерянные клиенты",
    description:
      "Бизнес у которого нет онлайн-записи теряет в среднем 23% клиентов которые «хотели записаться, но не дозвонились».",
    source: "Исследование Yclients, 2023",
    percent: 23,
    color: "bg-destructive/70",
    isPositive: false,
  },
  {
    num: "02",
    title: "Ручной учёт",
    description:
      "Сотрудник который ведёт учёт вручную тратит 8-12 часов в неделю на задачи которые система решает за 0 секунд. Это 2-3 рабочих дня в месяц.",
    source: "",
    percent: 35,
    color: "bg-destructive/70",
    isPositive: false,
    extraLabel: "8-12 ч/нед",
  },
  {
    num: "03",
    title: "Автоматические напоминания",
    description:
      "Компании с автоматическими напоминаниями о повторных визитах получают на 40% больше возвращающихся клиентов. Без дополнительных вложений в рекламу.",
    source: "",
    percent: 40,
    color: "bg-primary",
    isPositive: true,
  },
]

const ClientLossBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/analytics — сколько стоит «потом разберёмся»">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// три факта которые неприятно читать</div>

              <div className="h-2" />

              {/* Fact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {facts.slice(0, 2).map((fact, i) => (
                  <motion.div
                    key={fact.num}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                  >
                    {/* Number + title */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground font-mono">{fact.num}/</span>
                      <span className="text-foreground font-medium text-sm">{fact.title}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {fact.isPositive ? "прирост" : "потери"}
                        </span>
                        <span className={`font-mono font-bold text-lg ${fact.isPositive ? "text-primary" : "text-destructive"}`}>
                          {fact.percent}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${fact.color} rounded-full`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${fact.percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed">{fact.description}</p>
                    {fact.source && (
                      <div className="text-terminal-comment text-[10px] mt-2">{fact.source}</div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Third fact — full width */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="border border-primary/20 rounded-lg p-4 bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground font-mono">{facts[2].num}/</span>
                  <span className="text-foreground font-medium text-sm">{facts[2].title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary ml-auto">позитив</span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "40%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <span className="text-primary font-mono font-bold text-2xl text-glow-sm shrink-0">
                    +40%
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{facts[2].description}</p>
              </motion.div>

              <div className="h-2" />

              {/* Conclusion */}
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-destructive shrink-0">→</span>
                  <span className="text-foreground text-sm">
                    Вы платите за это <span className="text-destructive">каждый месяц.</span>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-destructive shrink-0">→</span>
                  <span className="text-foreground text-sm">
                    Просто не видите в какой строке расходов.
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

export default ClientLossBlock
