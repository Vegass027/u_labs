'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";

const DevelopersSection = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Brief viewer mock */}
          <TerminalWindow title="~/incoming-briefs — готовые заказы, а не «сырой поток»">
            <div className="space-y-4">
              <div className="text-terminal-comment text-xs">// хватит разбирать хаотичные сообщения от клиентов</div>

              {/* Brief card */}
              <div className="border border-primary/20 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">Новый бриф</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">brief-0042.md</span>
                </div>
                <div className="p-3 space-y-2 text-sm">
                  <div className="grid grid-cols-[100px_1fr] gap-1 text-xs sm:text-sm">
                    <span className="text-muted-foreground">Проект:</span>
                    <span className="text-foreground">Мобильное приложение бронирования</span>

                    <span className="text-muted-foreground">Тип:</span>
                    <span className="text-foreground">iOS + Android (React Native)</span>

                    <span className="text-muted-foreground">Функции:</span>
                    <span className="text-foreground">каталог, поиск, бронь, оплата, push</span>

                    <span className="text-muted-foreground">Бюджет:</span>
                    <span className="text-foreground">150 000 — 250 000 ₽</span>

                    <span className="text-muted-foreground">Срок:</span>
                    <span className="text-foreground">6-8 недель</span>
                  </div>
                </div>
                <div className="flex gap-2 px-3 py-2 border-t border-border">
                  <div className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-mono cursor-pointer hover:bg-primary/20 transition-colors">
                    принять →
                  </div>
                  <div className="px-3 py-1 rounded bg-muted text-muted-foreground text-xs font-mono cursor-pointer hover:bg-muted/80 transition-colors">
                    подробнее
                  </div>
                </div>
              </div>

              {/* Queue */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider border-b border-border flex items-center justify-between">
                  <span>очередь брифов</span>
                  <span className="text-primary">3 новых</span>
                </div>
                {[
                  { name: "CRM для автосервиса", tech: "React, Node.js", budget: "~120K" },
                  { name: "AI-чатбот поддержки", tech: "Python, Telegram API", budget: "~80K" },
                  { name: "Дашборд аналитики", tech: "React, D3.js", budget: "~95K" },
                ].map((brief, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm border-b border-border last:border-0">
                    <div className="min-w-0">
                      <div className="text-foreground truncate">{brief.name}</div>
                      <div className="text-muted-foreground text-xs">{brief.tech}</div>
                    </div>
                    <span className="text-primary font-mono shrink-0 ml-2">{brief.budget}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="text-primary">→</span> структурированные брифы, понятные задачи — меньше переписок, больше работы и денег
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default DevelopersSection;
