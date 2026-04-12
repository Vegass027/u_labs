'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const ManagerInfraBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/features — что вы получаете кроме денег">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// инструменты для работы — уже встроены в систему</div>

              <div className="h-2" />

              {/* 2x2 grid of feature mockups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Feature 1: Personal dashboard */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-mono">
                    личный кабинет
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="text-xs text-muted-foreground">Все заявки, статусы, история — в одном месте</div>
                    <div className="divide-y divide-border border border-border rounded">
                      {[
                        { name: "Автосервис «Мотор»", status: "done", statusLabel: "завершён" },
                        { name: "CRM для ритейла", status: "active", statusLabel: "в работе" },
                        { name: "Telegram-бот", status: "new", statusLabel: "новый" },
                      ].map((order, i) => (
                        <div key={i} className="flex items-center justify-between px-2 py-1.5 text-[10px]">
                          <span className="text-foreground truncate">{order.name}</span>
                          <span className={`shrink-0 ml-1 px-1 py-0.5 rounded ${
                            order.status === 'done' ? 'bg-primary/10 text-primary' :
                            order.status === 'active' ? 'bg-terminal-string/10 text-terminal-string' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {order.statusLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Feature 2: AI assistant */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-mono">
                    AI-ассистент
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="text-xs text-muted-foreground">Запишите разговор голосом — AI структурирует</div>
                    <div className="flex gap-1.5">
                      <span className="text-[10px] px-2 py-1 rounded border border-primary/40 text-primary bg-primary/5 font-mono">🎤 Голос</span>
                      <span className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground font-mono">✏️ Текст</span>
                    </div>
                    <div className="bg-card border border-border rounded p-2 text-[10px] text-muted-foreground font-mono">
                      <span className="text-terminal-comment">// расшифровка</span>
                      <div className="text-foreground mt-0.5">«Клиенту нужна CRM для учёта заявок...»</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-primary font-mono">AI → бриф готов</span>
                      <span className="text-primary">✓</span>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 3: Telegram notifications */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-mono">
                    Telegram уведомления
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="text-xs text-muted-foreground">Статус изменился — всё приходит мгновенно</div>
                    <div className="space-y-1.5">
                      {[
                        { icon: "💰", text: "+24 000 ₽ комиссия начислена", color: "text-primary" },
                        { icon: "📋", text: "CRM → статус: в работе", color: "text-foreground" },
                        { icon: "✅", text: "Автосервис — проект завершён", color: "text-primary" },
                      ].map((notif, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px]">
                          <span className="shrink-0">{notif.icon}</span>
                          <span className={notif.color}>{notif.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Feature 4: Transparent payouts */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-mono">
                    прозрачные выплаты
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="text-xs text-muted-foreground">Каждый рубль на виду</div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">зарезервировано</span>
                        <span className="text-terminal-string font-mono">12 000 ₽</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">доступно</span>
                        <span className="text-primary font-mono font-medium">127 450 ₽</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">выплачено</span>
                        <span className="text-foreground font-mono">89 000 ₽</span>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-border">
                      <span className="text-[10px] px-2 py-1 rounded border border-primary/40 text-primary font-mono inline-block">
                        запросить вывод →
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ManagerInfraBlock
