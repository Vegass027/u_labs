'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const steps = [
  {
    num: "01",
    title: "Находите бизнес с болью",
    description: "Знакомый, клиент, сосед по офису, пост в соцсети. Любой бизнес у которого есть ручные процессы — ваш потенциальный заказ.",
  },
  {
    num: "02",
    title: "Описываете задачу в системе",
    description: "Голосом или текстом. AI структурирует информацию. Не нужно быть техническим специалистом.",
  },
  {
    num: "03",
    title: "Получаете 30% с каждого заказа",
    description: "Мы делаем продукт, клиент платит. Комиссия начисляется автоматически — за все последующие проекты клиента.",
  },
]

const ManagerStepsBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/pipeline — три шага — и деньги на балансе">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// вся механика в трёх шагах</div>

              <div className="h-2" />

              {/* Pipeline steps */}
              <div className="space-y-1">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-start gap-3 py-2"
                  >
                    <span className="text-muted-foreground shrink-0 w-6 font-mono">{step.num}</span>
                    <span className="text-primary shrink-0">■</span>
                    <div>
                      <span className="text-foreground font-medium">{step.title}</span>
                      <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="h-3" />

              {/* Mockup: Step 1 — Contact list */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border font-mono">
                  шаг 1 — ваши контакты
                </div>
                <div className="divide-y divide-border">
                  {[
                    { name: "Автосервис «Мотор»", pain: "запись вручную", status: "есть боль" },
                    { name: "Салон красоты «Лиля»", pain: "нет учёта клиентов", status: "есть боль" },
                    { name: "Доставка еды", pain: "хаос в заказах", status: "есть боль" },
                  ].map((contact, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground">📞</span>
                        <span className="text-foreground truncate">{contact.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-xs">{contact.pain}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {contact.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mockup: Step 2 — Order creation form */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border font-mono">
                  шаг 2 — создание заявки
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded border border-primary/40 text-primary bg-primary/5 font-mono">
                      🎤 Записать голосом
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded border border-border text-muted-foreground font-mono">
                      ✏️ Написать текст
                    </button>
                  </div>
                  <div className="bg-card border border-border rounded p-2 text-xs text-muted-foreground font-mono leading-relaxed">
                    <span className="text-terminal-comment">// ваш текст или расшифровка голоса</span>
                    <div className="text-foreground mt-1">
                      «Автосервис на 3 мастера, принимают заявки в WhatsApp вручную, теряют клиентов...»
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-mono">AI структурирует →</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                      />
                    </div>
                    <span className="text-xs text-primary font-mono">100%</span>
                  </div>
                </div>
              </div>

              {/* Mockup: Step 3 — Balance */}
              <div className="border border-primary/20 rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">шаг 3 — ваш баланс</span>
                  <span className="text-xs text-primary font-mono">обновлено только что</span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl font-bold text-primary text-glow font-mono"
                >
                  42 000 ₽
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">доступно к выводу</div>
                <div className="mt-3 pt-3 border-t border-border divide-y divide-border">
                  {[
                    { project: "Автосервис «Мотор»", amount: "+24 000 ₽", status: "начислено" },
                    { project: "Салон «Лиля»", amount: "+18 000 ₽", status: "начислено" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 text-xs">
                      <span className="text-foreground">{tx.project}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{tx.status}</span>
                        <span className="text-primary font-mono font-medium">{tx.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="text-xs text-muted-foreground">
                <span className="text-primary">→</span> привели клиента один раз — получаете процент <span className="text-primary">всегда</span> с его будущих заказов
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-primary">→</span> прозрачный баланс, история выплат
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ManagerStepsBlock
