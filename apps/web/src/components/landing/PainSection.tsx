'use client';

import { motion } from "framer-motion";
import TerminalWindow from "./TerminalWindow";

const painLines = [
  { prompt: "error", text: "не можешь нормально объяснить, что именно нужно" },
  { prompt: "error", text: "разработчики «не понимают» тебя" },
  { prompt: "error", text: "переписки длятся днями" },
  { prompt: "error", text: "тебе задают 100 вопросов" },
  { prompt: "error", text: "в итоге получаешь не то, что ожидал" },
];

const PainSection = () => {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/diagnostics — знакомо?">
            <div className="space-y-1">
              <div className="text-terminal-comment mb-3">// ты хочешь реализовать идею, но:</div>
              {painLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-destructive shrink-0">[{line.prompt}]</span>
                  <span className="text-foreground">{line.text}</span>
                </motion.div>
              ))}
              <div className="h-4" />
              <div className="border-t border-border pt-3">
                <span className="text-terminal-prompt">diagnosis:</span>{' '}
                <span className="text-foreground">проблема не в тебе —</span>{' '}
                <span className="text-primary text-glow-sm">проблема в коммуникации</span>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default PainSection;
