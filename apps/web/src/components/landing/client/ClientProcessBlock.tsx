'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const steps = [
  {
    num: "01",
    title: "Описываете задачу",
    description: "Голосом или текстом. Не нужно готовить ТЗ. AI-ассистент задаст вопросы и соберёт всё в карточку.",
    time: "15-30 мин",
    icon: "🎤",
  },
  {
    num: "02",
    title: "Получаете предложение",
    description: "Чёткое КП: что делаем, сколько стоит, когда будет готово. Фиксированная цена, фиксированный срок.",
    time: "2 часа",
    icon: "📋",
  },
  {
    num: "03",
    title: "Наблюдаете за процессом",
    description: "Личный кабинет где видно статус каждого этапа. Чат с командой. Уведомления при обновлениях.",
    time: "2-8 недель",
    icon: "📊",
  },
  {
    num: "04",
    title: "Получаете продукт",
    description: "Принимаете работу. Обучение команды включено. Поддержка после запуска. Продукт ваш — полностью.",
    time: "готово",
    icon: "✅",
  },
]

const ClientProcessBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/pipeline — от разговора до продукта">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// четыре этапа — фиксированная цена и срок</div>

              <div className="h-2" />

              {/* Steps grid */}
              <div className="grid grid-cols-2 gap-3">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{step.icon}</span>
                      <span className="text-muted-foreground font-mono text-xs">{step.num}/</span>
                    </div>
                    <div className="text-foreground font-medium text-sm mb-1">{step.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-2">{step.description}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                        {step.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="h-2" />

              {/* Mockup: Personal dashboard */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border font-mono">
                  ваш личный кабинет — заказ #1247
                </div>
                <div className="p-3 space-y-3">
                  {/* Order header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-foreground text-sm font-medium">Автосервис «Мотор»</div>
                      <div className="text-terminal-comment text-[10px]">онлайн-запись + CRM</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-terminal-string/10 text-terminal-string font-mono">
                      в работе
                    </span>
                  </div>

                  {/* Progress stages */}
                  <div className="space-y-2">
                    {[
                      { label: "анализ", percent: 100, status: "done" },
                      { label: "дизайн", percent: 100, status: "done" },
                      { label: "разработка", percent: 70, status: "active" },
                      { label: "тестирование", percent: 0, status: "pending" },
                      { label: "запуск", percent: 0, status: "pending" },
                    ].map((stage, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`text-xs w-24 shrink-0 ${
                          stage.status === "done" ? "text-primary" :
                          stage.status === "active" ? "text-foreground" :
                          "text-muted-foreground"
                        }`}>
                          {stage.status === "done" ? "✓" : stage.status === "active" ? "▸" : "○"} {stage.label}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              stage.status === "done" ? "bg-primary" :
                              stage.status === "active" ? "bg-primary/60" :
                              "bg-transparent"
                            }`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${stage.percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">
                          {stage.percent}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chat preview */}
                  <div className="border-t border-border pt-2">
                    <div className="text-terminal-comment text-[10px] mb-1">// чат с командой</div>
                    <div className="flex items-start gap-2 text-[10px]">
                      <span className="text-primary shrink-0">команда:</span>
                      <span className="text-foreground">Дизайн согласован, начали разработку. Обновим через 3 дня.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ClientProcessBlock
