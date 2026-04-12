'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const services = [
  {
    icon: "🌐",
    title: "Веб-приложения",
    description: "Личные кабинеты, CRM-системы, порталы для клиентов, инструменты для команды.",
    priceFrom: 150,
    priceLabel: "от 150 000₽",
    barPercent: 75,
  },
  {
    icon: "🤖",
    title: "Telegram-боты",
    description: "Приём заявок, запись, уведомления, поддержка, продажи. Бот который работает 24/7.",
    priceFrom: 30,
    priceLabel: "от 30 000₽",
    barPercent: 15,
  },
  {
    icon: "⚡",
    title: "Автоматизация",
    description: "Убираем ручные операции. Интегрируем сервисы. Данные автоматически попадают куда нужно.",
    priceFrom: 60,
    priceLabel: "от 60 000₽",
    barPercent: 30,
  },
  {
    icon: "📊",
    title: "CRM под бизнес",
    description: "Не платите за лишние функции. CRM которая повторяет ваши процессы, а не заставляет подстраиваться.",
    priceFrom: 80,
    priceLabel: "от 80 000₽",
    barPercent: 40,
  },
  {
    icon: "🔗",
    title: "Интеграции",
    description: "Оплата, доставка, аналитика, мессенджеры, учётные системы. Всё работает вместе.",
    priceFrom: 40,
    priceLabel: "от 40 000₽",
    barPercent: 20,
  },
  {
    icon: "📱",
    title: "Мобильные приложения",
    description: "Для курьеров, мастеров, менеджеров в полях. Простые инструменты для команды на выезде.",
    priceFrom: 200,
    priceLabel: "от 200 000₽",
    barPercent: 100,
  },
]

const ClientServicesBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/services — какие задачи решаем">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// полный стек digital-инструментов для бизнеса</div>

              <div className="h-2" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{service.icon}</span>
                      <span className="text-foreground font-medium text-sm">{service.title}</span>
                    </div>

                    {/* Description */}
                    <div className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {service.description}
                    </div>

                    {/* Price bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">стоимость</span>
                        <span className="text-primary font-mono font-medium">{service.priceLabel}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary/60 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${service.barPercent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: i * 0.08 + 0.2 }}
                        />
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

export default ClientServicesBlock
