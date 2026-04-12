'use client'

import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"
import Link from "next/link"

const ManagerCTABlock = () => {
  return (
    <section className="relative py-20 md:py-32 px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/start — начните с одного разговора">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// подумайте о трёх людях которых вы знаете</div>

              <div className="h-1" />

              <div className="text-foreground text-sm leading-relaxed">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                Хотя бы один из них владеет бизнесом с ручными процессами.
              </div>

              <div className="h-1" />

              <div className="text-foreground text-sm leading-relaxed">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                Зарегистрируйтесь. Создайте первую заявку. Посмотрите как это работает.
              </div>

              <div className="h-1" />

              <div className="text-foreground text-sm leading-relaxed">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                Если не понравится — вы ничего не потеряли.
              </div>

              <div className="text-foreground text-sm leading-relaxed">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                Если понравится — у вас появится{' '}
                <span className="text-primary text-glow-sm">дополнительный источник дохода</span>{' '}
                который работает параллельно с тем что вы делаете сейчас.
              </div>

              <div className="h-4" />

              {/* CTA Button */}
              <Link href="/register?role=manager">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left flex items-center gap-3 px-5 py-4 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition-all group"
                >
                  <span className="text-primary font-mono text-sm group-hover:text-glow-sm">$</span>
                  <span className="text-primary font-mono text-base font-medium group-hover:text-glow-sm">
                    Стать партнёром
                  </span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-lg">→</span>
                </motion.button>
              </Link>

              <div className="text-center text-[10px] text-muted-foreground">
                Регистрация бесплатна. Никаких обязательств.
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default ManagerCTABlock
