'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"
import Link from "next/link"

const ClientFinalCTABlock = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/start — начните сейчас">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// один разговор изменит то как работает ваш бизнес</div>

              <div className="h-2" />

              <div className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                Не нужно готовить презентацию.
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                Не нужно писать ТЗ.
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                Просто расскажите что вас{' '}
                <span className="text-primary text-glow-sm">раздражает</span>{' '}
                в текущих процессах.
              </div>

              <div className="h-2" />

              <div className="text-sm text-muted-foreground">
                <span className="text-terminal-comment">// остальное сделаем мы</span>
              </div>

              <div className="h-4" />

              <Link href="/register?role=client">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-lg border border-primary/40 text-primary font-mono text-base hover:bg-primary/10 transition-colors"
                >
                  <span className="text-terminal-comment mr-2">$</span>
                  Описать задачу →
                </motion.button>
              </Link>

              <div className="text-terminal-comment text-xs text-center">
                // бесплатно · разбор за 2 часа · фиксированная цена
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ClientFinalCTABlock
