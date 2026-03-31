'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";

const HowItWorksSection = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/pipeline — от идеи до проекта">
            <div className="space-y-1">
              <div className="text-terminal-comment">// как это работает</div>
              <div className="h-2" />

              {[
                { step: "01", status: "done", text: "Ты описываешь идею (текст / голос)" },
                { step: "02", status: "done", text: "AI превращает это в понятный бриф" },
                { step: "03", status: "done", text: "Заявка уходит специалистам" },
                { step: "04", status: "active", text: "Ты получаешь предложение и общаешься в одном месте" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-3 py-2"
                >
                  <span className="text-muted-foreground shrink-0 w-6">{item.step}</span>
                  <span className={`shrink-0 ${item.status === 'done' ? 'text-primary' : 'text-terminal-string'}`}>
                    {item.status === 'done' ? '■' : '▸'}
                  </span>
                  <span className={`${item.status === 'active' ? 'text-primary text-glow-sm' : 'text-foreground'}`}>
                    {item.text}
                  </span>
                </motion.div>
              ))}

              <div className="h-3" />
              <div className="flex items-center gap-3 border-t border-border pt-3">
                {/* Progress bar */}
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "85%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                  />
                </div>
                <span className="text-xs text-primary font-mono">85%</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">без хаоса. без потери смысла.</div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
