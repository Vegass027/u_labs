'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";
import Link from "next/link";

interface RoleOption {
  symbol: string;
  label: string;
  href: string;
}

const roles: RoleOption[] = [
  { symbol: "◉", label: "Хочу автоматизировать процессы в бизнесе", href: "/describe-idea" },
  { symbol: "◎", label: "Хочу зарабатывать приводя клиентов", href: "/earn" },
  { symbol: "◎", label: "Я разработчик, хочу в команду", href: "/dev-mode" },
  { symbol: "◈", label: "Войти в кабинет", href: "/login" },
];

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
          <TerminalWindow title="~/welcome">
            <div className="space-y-5">
              <div className="text-terminal-comment text-base sm:text-lg">
                <span className="text-terminal-comment">// </span>
                <span className="text-foreground/70">что вас сюда привело?</span>
              </div>

              <div className="space-y-2">
                {roles.map((role, i) => (
                  <Link key={i} href={role.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="group flex items-start gap-3 py-2 px-3 -mx-3 rounded-md hover:bg-primary/[0.04] transition-colors cursor-pointer"
                    >
                      <span className="text-terminal-comment text-sm mt-0.5 select-none">
                        {role.symbol}
                      </span>
                      <span className="text-base sm:text-lg font-medium text-foreground/80 group-hover:text-primary group-hover:text-glow-sm transition-colors">
                        {role.label}
                      </span>
                    </motion.div>
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

export default HeroSection;
