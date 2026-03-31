'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";

const SolutionSection = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Simulated chat / AI interaction */}
          <TerminalWindow title="~/ai-brief-builder">
            <div className="space-y-4">
              <div className="text-terminal-comment">// просто расскажи, что хочешь</div>
              <div className="text-terminal-comment">// не нужно писать ТЗ. не нужно разбираться в терминах.</div>
              
              <div className="h-2" />

              {/* User message bubble */}
              <div className="flex justify-end">
                <div className="bg-muted rounded-lg rounded-br-sm px-4 py-2.5 max-w-[80%]">
                  <div className="text-xs text-muted-foreground mb-1">ты:</div>
                  <div className="text-foreground text-sm">
                    Хочу приложение для бронирования столов в ресторанах. Типа как в Яндексе, но попроще и для одного города.
                  </div>
                </div>
              </div>

              {/* AI processing */}
              <div className="flex justify-start">
                <div className="border border-primary/20 rounded-lg rounded-bl-sm px-4 py-2.5 max-w-[85%]">
                  <div className="text-xs text-primary mb-2">AI-ассистент:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-primary">✓</span>
                      <span className="text-foreground">Выделил суть: бронирование столов, один город</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary">✓</span>
                      <span className="text-foreground">Структура: каталог → карточка → бронь → подтверждение</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-string">?</span>
                      <span className="text-foreground">Нужна ли оплата онлайн или только бронь?</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-string">?</span>
                      <span className="text-foreground">Будет ли админка для ресторанов?</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="border-t border-border pt-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary">$</span>
                  <span className="text-foreground">brief.md сформирован</span>
                  <span className="text-primary">→</span>
                  <span className="text-primary text-glow-sm">отправлен в работу</span>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;
