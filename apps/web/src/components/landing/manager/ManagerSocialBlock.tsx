'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const stories = [
  {
    role: "Менеджер по продажам",
    city: "Краснодар",
    client: "Автосервис — запись онлайн",
    duration: "3 недели",
    deal: "80 000 ₽",
    commission: "+24 000 ₽",
    effort: "20 минут разговора",
  },
  {
    role: "Маркетолог на фрилансе",
    city: "Москва",
    client: "Обработка заявок",
    duration: "2 недели",
    deal: "60 000 ₽",
    commission: "+18 000 ₽",
    effort: "передала клиента",
  },
  {
    role: "Бывший офис-менеджер",
    city: "Екатеринбург",
    client: "3 сделки за 2 месяца",
    duration: "2 месяца",
    deal: "223 000 ₽",
    commission: "+67 000 ₽",
    effort: "сеть контактов",
  },
]

const ManagerSocialBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/testimonials — кто уже работает с нами">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// реальные истории без имён</div>

              <div className="h-2" />

              {/* Deal cards — styled like order cards in manager dashboard */}
              <div className="space-y-3">
                {stories.map((story, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    {/* Deal header */}
                    <div className="px-3 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">сделка #{i + 1}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">done</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{story.duration}</span>
                    </div>

                    {/* Deal body */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">👤</span>
                        <span className="text-foreground">{story.role}</span>
                        <span className="text-muted-foreground text-xs">· {story.city}</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span className="text-primary">→</span> {story.client}
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                          />
                        </div>
                        <span className="text-[10px] text-primary font-mono">100%</span>
                      </div>

                      {/* Deal metrics */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground">сделка: <span className="text-foreground font-mono">{story.deal}</span></span>
                          <span className="text-muted-foreground">усилие: <span className="text-foreground">{story.effort}</span></span>
                        </div>
                        <span className="text-primary font-mono font-medium text-sm">{story.commission}</span>
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

export default ManagerSocialBlock
