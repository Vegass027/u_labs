'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";

const CommunicationSection = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Simulated chat app interface */}
          <TerminalWindow title="~/workspace — вся коммуникация в одном окне">
            <div className="space-y-0">
              {/* Sidebar + Chat mock */}
              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-0 border border-border rounded-lg overflow-hidden -mx-1">
                {/* Sidebar */}
                <div className="bg-muted/50 border-r border-border p-3 space-y-2 text-xs">
                  <div className="text-muted-foreground uppercase tracking-wider mb-3 text-[10px]">проекты</div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-card border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-primary truncate">Приложение</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground truncate">Лендинг</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground truncate">CRM бот</span>
                  </div>

                  <div className="border-t border-border pt-3 mt-3">
                    <div className="text-muted-foreground uppercase tracking-wider mb-2 text-[10px]">статус</div>
                    <div className="flex items-center gap-1.5 text-primary text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      В работе
                    </div>
                  </div>
                </div>

                {/* Chat area */}
                <div className="p-3 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0">D</div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">Разработчик · 14:32</div>
                      <div className="text-foreground mt-0.5">Бриф получен, начинаю прототип. Будет готов через 2 дня.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-[10px] text-primary shrink-0">Я</div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">Вы · 14:35</div>
                      <div className="text-foreground mt-0.5">Отлично! Жду 👍</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0">S</div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">Система · 14:35</div>
                      <div className="text-primary mt-0.5">Статус обновлён: в разработке</div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50 border border-border">
                      <span className="text-muted-foreground text-xs flex-1">Написать сообщение...</span>
                      <span className="text-primary text-xs">↵</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                <span className="text-primary">→</span> чат, история, статусы — ты всегда понимаешь, что происходит
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunicationSection;
