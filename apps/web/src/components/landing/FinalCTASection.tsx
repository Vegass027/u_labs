'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";
import Link from "next/link";

const FinalCTASection = () => {
  return (
    <section className="relative py-20 md:py-32 px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/start — начни с идеи">
            <div className="space-y-3">
              <div className="text-terminal-comment">// не нужно готовить ТЗ</div>
              <div className="text-terminal-comment">// не нужно разбираться в разработке</div>
              <div className="h-1" />
              <div className="text-foreground text-base sm:text-lg">
                Просто опиши, что хочешь —{' '}
                <span className="text-primary text-glow-sm">остальное система сделает за тебя.</span>
              </div>
              <div className="h-4" />

              {/* CTA as terminal commands */}
              <div className="space-y-2">
                {[
                  { cmd: "./start --describe", label: "Описать идею", href: "/register?role=client" },
                  { cmd: "./start --earn", label: "Начать зарабатывать", href: "/register?role=manager" },
                  { cmd: "./start --dev", label: "Получать заказы", href: "/register?role=developer" },
                ].map((btn, i) => (
                  <Link key={i} href={btn.href}>
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <span className="text-primary font-mono text-sm group-hover:text-glow-sm">$</span>
                      <span className="text-primary font-mono text-sm">{btn.cmd}</span>
                      <span className="text-muted-foreground text-xs ml-auto">{btn.label}</span>
                      <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </motion.button>
                  </Link>
                ))}
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
