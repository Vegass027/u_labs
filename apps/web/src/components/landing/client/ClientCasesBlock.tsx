'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

interface CaseMetric {
  value: string
  label: string
  isPositive: boolean
}

interface CaseData {
  title: string
  scale: string
  problem: string
  metrics: CaseMetric[]
  solutions: string[]
  period: string
}

const cases: CaseData[] = [
  {
    title: "Сеть автосервисов",
    scale: "4 точки, Краснодар",
    problem: "Запись через WhatsApp и звонки. Администратор не успевал. Клиенты уходили к конкурентам. Повторные ТО никто не отслеживал.",
    metrics: [
      { value: "+34%", label: "повторных визитов", isPositive: true },
      { value: "-60%", label: "нагрузки на админа", isPositive: true },
      { value: "3 мес", label: "окупаемость", isPositive: true },
    ],
    solutions: ["Онлайн-запись", "Напоминания в Telegram", "Уведомления о ТО", "Дашборд загрузки"],
    period: "6 недель",
  },
  {
    title: "Частная клиника",
    scale: "8 врачей, Москва",
    problem: "20% неявок без предупреждения. Врачи простаивают. Администратор тратил 3 часа в день на подтверждения.",
    metrics: [
      { value: "6%", label: "неявки (было 20%)", isPositive: true },
      { value: "3 ч/день", label: "освобождено", isPositive: true },
      { value: "+180к₽", label: "доп. выручка/мес", isPositive: true },
    ],
    solutions: ["Онлайн-запись с подтверждением", "Напоминания за 24ч и 2ч", "Перенос без звонка", "История посещений"],
    period: "4 недели",
  },
  {
    title: "Служба доставки",
    scale: "40 курьеров, Екатеринбург",
    problem: "Диспетчер распределял заказы вручную. Клиенты звонили узнать где заказ. Учёт рабочего времени — в Excel.",
    metrics: [
      { value: "-45 мин", label: "на каждую смену", isPositive: true },
      { value: "-70%", label: "звонков в поддержку", isPositive: true },
      { value: "+30%", label: "больше заказов", isPositive: true },
    ],
    solutions: ["Приложение для курьеров", "Автораспределение по зонам", "Трекинг для клиентов", "Дашборд диспетчера"],
    period: "8 недель",
  },
]

const ClientCasesBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/cases — что получили клиенты">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// реальные результаты — реальные бизнесы</div>

              <div className="h-2" />

              {/* Case cards */}
              <div className="space-y-3">
                {cases.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    {/* Case header */}
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div>
                        <div className="text-foreground font-medium text-sm">{c.title}</div>
                        <div className="text-terminal-comment text-[10px]">{c.scale}</div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary font-mono">
                        {c.period}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Problem */}
                      <div>
                        <div className="text-terminal-comment text-[10px] mb-1">// проблема</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{c.problem}</div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2">
                        {c.metrics.map((metric, j) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 + j * 0.08 }}
                            className="text-center p-2 rounded-lg border border-border"
                          >
                            <div className={`text-lg sm:text-xl font-bold font-mono ${
                              metric.isPositive ? "text-primary text-glow-sm" : "text-destructive"
                            }`}>
                              {metric.value}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{metric.label}</div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Solutions as tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {c.solutions.map((s, j) => (
                          <span
                            key={j}
                            className="text-[10px] px-2 py-1 rounded border border-primary/20 text-primary bg-primary/5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ClientCasesBlock
