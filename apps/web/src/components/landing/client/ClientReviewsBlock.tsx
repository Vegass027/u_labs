'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const reviews = [
  {
    stars: 5,
    text: "Я думал что автоматизация — это для крупного бизнеса. Оказалось, мой автосервис на 3 поста может работать как большая сеть. Онлайн-запись окупилась за месяц.",
    author: "Андрей К.",
    business: "Автосервис, Ростов-на-Дону",
  },
  {
    stars: 5,
    text: "Описал задачу голосом за 10 минут. Через 2 часа получил предложение с ценой и сроком. Никто раньше так не работал со мной. Обычно неделю переписываешься и всё равно непонятно.",
    author: "Марина Л.",
    business: "Косметологическая клиника, Санкт-Петербург",
  },
  {
    stars: 5,
    text: "Сделали Telegram-бот для приёма заявок. Теперь менеджер не тратит время на первичную обработку. Бот собирает всю информацию и отправляет готовую заявку. Окупился за 6 недель.",
    author: "Игорь В.",
    business: "Оптовая компания, Новосибирск",
  },
  {
    stars: 5,
    text: "Боялся что будет долго и непонятно. Оказалось — видел каждый этап в личном кабинете. Никаких сюрпризов. Сдали в срок.",
    author: "Светлана М.",
    business: "Учебный центр, Казань",
  },
]

const ClientReviewsBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/reviews — говорят клиенты">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// реальные отзывы — реальные результаты</div>

              <div className="h-2" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviews.map((review, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                  >
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: review.stars }).map((_, j) => (
                        <span key={j} className="text-terminal-string text-sm">★</span>
                      ))}
                    </div>

                    {/* Review text */}
                    <div className="text-xs text-foreground leading-relaxed mb-3">
                      «{review.text}»
                    </div>

                    {/* Author */}
                    <div className="border-t border-border pt-2">
                      <div className="text-foreground text-xs font-medium">{review.author}</div>
                      <div className="text-terminal-comment text-[10px]">{review.business}</div>
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

export default ClientReviewsBlock
