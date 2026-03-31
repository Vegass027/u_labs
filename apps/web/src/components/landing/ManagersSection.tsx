'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";

const ManagersSection = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Earnings dashboard mock */}
          <TerminalWindow title="~/manager-dashboard — зарабатывай, приводя клиентов">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// тебе не нужно разбираться в разработке, делать проекты или нанимать команду</div>

              {/* Balance card */}
              <div className="border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">баланс</span>
                  <span className="text-xs text-primary font-mono">обновлено только что</span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl font-bold text-primary text-glow font-mono"
                >
                  127 450 ₽
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">доступно к выводу</div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "клиентов", value: "23" },
                  { label: "проектов", value: "18" },
                  { label: "конверсия", value: "78%" },
                ].map((stat, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      className="text-xl font-bold text-foreground font-mono"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Transaction log */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  последние начисления
                </div>
                <div className="divide-y divide-border">
                  {[
                    { project: "Приложение доставки", amount: "+18 500 ₽", date: "28.03", status: "начислено" },
                    { project: "CRM система", amount: "+32 000 ₽", date: "25.03", status: "начислено" },
                    { project: "Лендинг студии", amount: "+8 200 ₽", date: "22.03", status: "выведено" },
                    { project: "Telegram бот", amount: "+12 750 ₽", date: "19.03", status: "выведено" },
                  ].map((tx, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground shrink-0">{tx.date}</span>
                        <span className="text-foreground truncate">{tx.project}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${tx.status === 'начислено' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {tx.status}
                        </span>
                        <span className="text-primary font-mono font-medium">{tx.amount}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="text-primary">→</span> приводишь клиента → создаёшь заявку → система всё оформляет → получаешь %
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default ManagersSection;
