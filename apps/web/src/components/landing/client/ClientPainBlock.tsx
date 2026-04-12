'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

interface NicheData {
  id: string
  label: string
  icon: string
  comment: string
  problems: string[]
  losses: { label: string; percent: number; value: string }[]
  solutions: string[]
}

const niches: NicheData[] = [
  {
    id: "autoservice",
    label: "Автосервис",
    icon: "🔧",
    comment: "// автосервис / шиномонтаж / детейлинг",
    problems: [
      "Запись через WhatsApp и звонки",
      "Мастер не знает загрузку на следующей неделе",
      "Клиент записался — и пропал. Напомнить некому",
      "Склад запчастей считается «на глаз»",
      "Повторные клиенты не возвращаются — некому напомнить о ТО",
    ],
    losses: [
      { label: "клиентов теряется", percent: 30, value: "25-35%" },
      { label: "времени на звонки", percent: 15, value: "10-15%" },
      { label: "простой боксов", percent: 20, value: "неравномерно" },
    ],
    solutions: [
      "Онлайн-запись с выбором мастера и бокса",
      "Автоматические напоминания через Telegram",
      "История по каждому автомобилю",
      "Склад запчастей с остатками",
    ],
  },
  {
    id: "medicine",
    label: "Медицина",
    icon: "🏥",
    comment: "// стоматология / косметология / частные клиники",
    problems: [
      "Администратор весь день на телефоне",
      "Пациент записался на 2 недели вперёд и забыл",
      "Нет напоминаний — 20% неявок",
      "Врачи не видят расписание друг друга",
      "Повторные визиты теряются",
    ],
    losses: [
      { label: "неявки врача", percent: 20, value: "2-5к₽/слот" },
      { label: "времени администратора", percent: 20, value: "20%" },
      { label: "уходят к конкурентам", percent: 25, value: "«неудобно»" },
    ],
    solutions: [
      "Онлайн-запись с подтверждением",
      "Напоминания за 24 и 2 часа",
      "Личный кабинет пациента с историей",
      "Аналитика по загрузке врачей",
    ],
  },
  {
    id: "delivery",
    label: "Доставка",
    icon: "📦",
    comment: "// курьерские службы / доставка еды / логистика",
    problems: [
      "Заявки принимают вручную",
      "Диспетчер распределяет курьеров по телефону",
      "Клиент не знает где его заказ",
      "Отчёты считаются в Excel в конце дня",
      "Споры с клиентами — слово против слова",
    ],
    losses: [
      { label: "на распределение смены", percent: 40, value: "30-40 мин" },
      { label: "звонки «где заказ?»", percent: 15, value: "15%" },
      { label: "ошибки при вводе", percent: 10, value: "возвраты" },
    ],
    solutions: [
      "Система заявок с автораспределением",
      "Трекинг курьеров в реальном времени",
      "Уведомления клиенту на каждом этапе",
      "Дашборд с аналитикой по смене",
    ],
  },
  {
    id: "education",
    label: "Образование",
    icon: "📚",
    comment: "// онлайн-школы / репетиторы / учебные центры",
    problems: [
      "Продажи через переписку в Instagram",
      "Ученики «теряются» между уроками",
      "Нет напоминаний — пропуски растут",
      "Домашние задания принимают в Telegram",
      "Успеваемость считается вручную",
    ],
    losses: [
      { label: "не доходит до конца", percent: 40, value: "40%" },
      { label: "возвраты и негатив", percent: 15, value: "каждый недосмотр" },
      { label: "время на админ", percent: 25, value: "преподавателя" },
    ],
    solutions: [
      "Личный кабинет ученика с прогрессом",
      "Автоматические напоминания об уроках",
      "Встроенные домашние задания с проверкой",
      "Аналитика по каждому ученику",
    ],
  },
]

const ClientPainBlock = () => {
  const [activeNiche, setActiveNiche] = useState<string>(niches[0].id)

  const active = niches.find((n) => n.id === activeNiche) ?? niches[0]

  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/pain-points — узнайте себя">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// выберите свою ситуацию</div>

              <div className="h-2" />

              {/* Niche tabs */}
              <div className="flex flex-wrap gap-2">
                {niches.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setActiveNiche(n.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-colors
                      ${activeNiche === n.id
                        ? "border-primary/40 text-primary bg-primary/5"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                      }
                    `}
                  >
                    <span>{n.icon}</span>
                    <span>{n.label}</span>
                  </button>
                ))}
              </div>

              <div className="h-2" />

              {/* Active niche content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Niche header */}
                  <div className="text-terminal-comment text-xs">{active.comment}</div>

                  {/* Two columns: problems + losses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Problems */}
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-mono">
                        проблема
                      </div>
                      <div className="p-3 space-y-2">
                        {active.problems.map((problem, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2 text-xs"
                          >
                            <span className="text-destructive shrink-0 mt-0.5">✗</span>
                            <span className="text-foreground">{problem}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Losses with progress bars */}
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-mono">
                        что теряете
                      </div>
                      <div className="p-3 space-y-3">
                        {active.losses.map((loss, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{loss.label}</span>
                              <span className="text-destructive font-mono font-medium">{loss.value}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-destructive/70 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${loss.percent}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Solutions */}
                  <div className="border border-primary/20 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-primary/5 border-b border-primary/10 text-xs text-primary uppercase tracking-wider font-mono">
                      что делаем
                    </div>
                    <div className="p-3 flex flex-wrap gap-2">
                      {active.solutions.map((solution, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 + 0.3 }}
                          className="text-xs px-2.5 py-1 rounded border border-primary/20 text-primary bg-primary/5"
                        >
                          ✅ {solution}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ClientPainBlock
