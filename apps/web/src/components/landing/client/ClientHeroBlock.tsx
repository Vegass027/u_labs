'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"
import Link from "next/link"

const ClientHeroBlock = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-16">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <TerminalWindow title="~/idea-to-project — describe your idea">
            <div className="space-y-3">
              <div>
                <span className="text-terminal-comment">// опиши проблему — получи решение</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-snug">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                <span className="text-foreground">Ваш бизнес работает на процессах</span>{' '}
                <span className="text-destructive">2015 года.</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-snug">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                <span className="text-foreground">Конкуренты уже</span>{' '}
                <span className="text-primary text-glow-sm">автоматизировали.</span>
              </div>

              <div className="h-4" />

              <div className="text-terminal-comment text-xs">
                <span className="text-terminal-comment">// что мы делаем</span>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-terminal-prompt mr-1">{'>'}</span>
                Убираем ручной труд, возвращаем потерянных клиентов, даём контроль над бизнесом.
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="text-terminal-prompt mr-1">{'>'}</span>
                Не консультируем — <span className="text-foreground">делаем.</span>
              </div>

              <div className="h-4" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link href="/register?role=client">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 rounded-lg border border-primary/40 text-primary font-mono text-sm hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-terminal-comment mr-1.5">$</span>
                    Описать задачу →
                  </motion.button>
                </Link>
                <button
                  onClick={() => document.getElementById("c-cases")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground font-mono text-sm hover:text-foreground hover:border-foreground/20 transition-colors"
                >
                  <span className="text-terminal-comment mr-1.5">#</span>
                  Смотреть кейсы ↓
                </button>
              </div>

              <div className="text-terminal-comment text-xs mt-2">
                // ответ за 2 часа · первый разбор задачи — бесплатно
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ClientHeroBlock
