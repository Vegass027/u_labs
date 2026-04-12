'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const ManagerFrameBlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/mindset — вы не продаёте, вы решаете">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// большинство людей боятся слова «продажи»</div>

              <div className="h-2" />

              {/* Chat interface — user fear */}
              <div className="flex justify-end">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-muted rounded-lg rounded-br-sm px-4 py-2.5 max-w-[80%]"
                >
                  <div className="text-xs text-muted-foreground mb-1">вы:</div>
                  <div className="text-foreground text-sm">
                    «Я не умею продавать. Нет опыта продаж.»
                  </div>
                </motion.div>
              </div>

              {/* System response */}
              <div className="flex justify-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="border border-primary/20 rounded-lg rounded-bl-sm px-4 py-2.5 max-w-[85%]"
                >
                  <div className="text-xs text-primary mb-2">system:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">→</span>
                      <span className="text-foreground">Здесь нет холодных звонков, скриптов и давления</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">→</span>
                      <span className="text-foreground">Найдите человека с проблемой</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">→</span>
                      <span className="text-foreground">Выслушайте его</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">→</span>
                      <span className="text-foreground">Передайте нам</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">→</span>
                      <span className="text-primary">Всё остальное делаем мы</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Real conversation mockup */}
              <div className="h-2" />
              <div className="border border-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">
                  пример разговора
                </div>
                <div className="space-y-1.5 text-sm font-mono">
                  <div className="text-foreground">
                    <span className="text-terminal-prompt">{'>'}</span> «А как вы сейчас принимаете заявки?»
                  </div>
                  <div className="text-muted-foreground">
                    <span className="text-terminal-comment">// клиент рассказывает о проблеме</span>
                  </div>
                  <div className="text-foreground">
                    <span className="text-terminal-prompt">{'>'}</span> «Я знаю как это исправить. Давайте я расскажу.»
                  </div>
                </div>
              </div>

              {/* Conclusion */}
              <div className="border-t border-border pt-3">
                <div className="text-foreground text-sm">
                  Вы не продаёте сайты. Вы показываете владельцу автосервиса{' '}
                  <span className="text-primary text-glow-sm">как перестать терять клиентов.</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Это другой разговор.</div>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ManagerFrameBlock
