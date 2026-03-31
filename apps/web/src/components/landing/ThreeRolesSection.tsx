'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";

const ThreeRolesSection = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/system-map — три роли, одна система">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// каждый получает свою выгоду</div>

              {/* Visual system diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    role: "CLIENT",
                    label: "Клиент",
                    desc: "Быстро превращает идею в понятный проект",
                    icon: "◉",
                  },
                  {
                    role: "MANAGER",
                    label: "Менеджер",
                    desc: "Зарабатывает на привлечении клиентов",
                    icon: "◎",
                  },
                  {
                    role: "DEV",
                    label: "Разработчик",
                    desc: "Получает готовые задачи без хаоса",
                    icon: "◈",
                  },
                ].map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors group"
                  >
                    <div className="text-primary text-2xl mb-2 group-hover:text-glow-sm transition-all">{r.icon}</div>
                    <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{r.role}</div>
                    <div className="text-foreground font-medium mt-1">{r.label}</div>
                    <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.desc}</div>
                  </motion.div>
                ))}
              </div>

              {/* Connection lines (text representation) */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
                <span>CLIENT</span>
                <span className="text-primary">←→</span>
                <span className="text-primary text-glow-sm">SYSTEM</span>
                <span className="text-primary">←→</span>
                <span>DEV</span>
              </div>
              <div className="flex items-center justify-center text-xs text-muted-foreground font-mono">
                <span className="text-primary">↑</span>
              </div>
              <div className="flex items-center justify-center text-xs text-muted-foreground font-mono">
                <span>MANAGER</span>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                <span className="text-primary">→</span> все взаимодействуют в одной системе
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default ThreeRolesSection;
