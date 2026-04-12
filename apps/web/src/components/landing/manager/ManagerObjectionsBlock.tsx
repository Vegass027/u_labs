'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const objections: { question: string; answer?: string; items?: string[] }[] = [
  {
    question: "«Я не разбираюсь в IT»",
    answer: "Не нужно. Вы находите проблему — мы предлагаем решение. Технические вопросы полностью на нашей стороне.",
  },
  {
    question: "«Откуда мне знать кому это нужно?»",
    answer: "Любой бизнес который использует Excel, мессенджеры или нанимает людей для ручной работы — нуждается в автоматизации. Таких большинство.",
  },
  {
    question: "«А вдруг клиент откажется?»",
    answer: "Отказ — нормальная часть процесса. Вы не несёте никаких обязательств и не тратите деньги. Только время на один разговор.",
  },
  {
    question: "«Сколько можно реально зарабатывать?»",
    answer: "Один средний проект — 50 000 - 200 000 ₽. Ваши 30% — 15 000 - 60 000 ₽ с одной сделки. Без потолка. Без плана. Без оклада.",
  },
  {
    question: "Кому это подходит?",
    items: [
      "Менеджеры по продажам",
      "Маркетологи на фрилансе",
      "Бывшие сотрудники из продаж/офиса с сетью контактов",
      "Замотивированные люди, которые хотят зарабатывать в сфере IT",
    ],
  },
]

const ManagerObjectionsBlock = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/faq — вопросы которые возникают у всех">
            <div className="space-y-3">
              <div className="text-terminal-comment text-xs">// нажмите на вопрос чтобы раскрыть ответ</div>

              <div className="h-2" />

              <div className="space-y-2">
                {objections.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="w-full text-left flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-primary shrink-0 font-mono text-xs">?</span>
                        <span className="text-foreground text-sm">{item.question}</span>
                      </div>
                      <motion.span
                        animate={{ rotate: openIndex === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground shrink-0 text-xs"
                      >
                        ▼
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 border-t border-border pt-3">
                            {item.items ? (
                              <div className="space-y-2">
                                {item.items.map((li, j) => (
                                  <div key={j} className="flex items-start gap-2 text-sm">
                                    <span className="text-primary shrink-0">→</span>
                                    <span className="text-muted-foreground">{li}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 text-sm">
                                <span className="text-primary shrink-0">→</span>
                                <span className="text-muted-foreground">{item.answer}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

export default ManagerObjectionsBlock
