'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const faqItems = [
  {
    question: "Сколько стоит разработка?",
    answer: "Зависит от задачи. Простой Telegram-бот — от 30 000₽. CRM-система — от 80 000₽. Веб-приложение — от 150 000₽. Точную цену называем после того как поняли задачу. Первый разбор — бесплатно.",
  },
  {
    question: "Как долго делаете?",
    answer: "Telegram-бот — 1-2 недели. CRM или веб-приложение — 3-8 недель. Фиксируем срок в договоре.",
  },
  {
    question: "Нужно ли мне разбираться в IT?",
    answer: "Нет. Вы объясняете бизнес-задачу. Мы переводим её в техническое решение.",
  },
  {
    question: "Что если не понравится результат?",
    answer: "Принимаете работу поэтапно. Правки включены в стоимость. Не подпишете акт пока не будет так как договорились.",
  },
  {
    question: "У меня маленький бизнес, это для меня?",
    answer: "Автоматизация окупается быстрее в малом бизнесе потому что каждый сотрудник на счету. Минимальный проект — от 30 000₽.",
  },
  {
    question: "Продукт потом мой?",
    answer: "Полностью. Код, домен, хостинг — всё ваше. Мы не привязываем к себе.",
  },
]

const ClientFAQBlock = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/faq — частые вопросы">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// нажмите чтобы раскрыть ответ</div>

              <div className="h-2" />

              <div className="space-y-1">
                {faqItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <button
                      onClick={() => toggle(i)}
                      className="w-full text-left flex items-start gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <span className={`shrink-0 font-mono text-xs mt-0.5 transition-colors ${
                        openIndex === i ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {openIndex === i ? "▾" : "▸"}
                      </span>
                      <span className={`text-sm transition-colors ${
                        openIndex === i ? "text-primary" : "text-foreground"
                      }`}>
                        {item.question}
                      </span>
                    </button>

                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-5 mr-3 mb-2 px-3 py-2 border border-border rounded-lg text-xs text-muted-foreground leading-relaxed">
                            {item.answer}
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

export default ClientFAQBlock
