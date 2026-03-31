'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-16">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <TerminalWindow title="~/idea-to-project">
            <div className="space-y-3">
              <div>
                <span className="text-terminal-comment">// опиши идею — получи готовое решение</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-snug">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                <span className="text-foreground">Говори голосом или текстом.</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-snug">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                <span className="text-foreground">AI превратит мысль в</span>{' '}
                <span className="text-primary text-glow-sm">чёткий бриф</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-snug">
                <span className="text-terminal-prompt">{'>'}</span>{' '}
                <span className="text-foreground">и отправит специалистам.</span>
              </div>
              <div className="h-4" />
              <div className="text-muted-foreground text-xs">
                <span className="text-terminal-comment">// без долгих переписок и непонимания</span>
              </div>
              <div className="h-3" />
              <div className="flex items-center gap-2">
                <span className="text-terminal-prompt">$</span>
                <span className="text-foreground">выбери роль</span>
                <span className="w-2 h-5 bg-primary animate-blink inline-block" />
              </div>
            </div>
          </TerminalWindow>

          {/* CTA buttons as terminal commands */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              { cmd: "./describe-idea", label: "Описать идею", flag: "--client", href: "/register?role=client" },
              { cmd: "./earn", label: "Хочу зарабатывать", flag: "--manager", href: "/register?role=manager" },
              { cmd: "./dev-mode", label: "Я разработчик", flag: "--dev", href: "/register?role=developer" },
            ].map((btn, i) => (
              <Link key={i} href={btn.href}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative text-left px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors w-full"
                >
                  <div className="font-mono text-xs text-terminal-comment">{btn.flag}</div>
                  <div className="font-mono text-sm text-primary group-hover:text-glow-sm">{btn.cmd}</div>
                  <div className="text-xs text-muted-foreground mt-1">{btn.label}</div>
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
