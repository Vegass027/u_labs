'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TerminalWindow from "./TerminalWindow";
import Link from "next/link";

const items = [
  "стартап",
  "сайт или приложение",
  "автоматизацию",
  "AI-инструмент",
  "любой digital-проект",
];

const PossibilitiesSection = () => {
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userInput.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <TerminalWindow title="~/projects — любая идея может стать проектом">
            <div className="space-y-2">
              <div className="text-terminal-comment">// ты можешь реализовать:</div>
              <div className="h-1" />
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-primary">▸</span>
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
              <div className="h-3" />
              <div className="border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-primary">$</span>
                  <span className="text-terminal-string">Я хочу создать...</span>
                  <span className="relative inline-flex items-center flex-1">
                    <span className="text-primary font-mono text-sm whitespace-pre">{userInput}</span>
                    <span className="w-2.5 h-5 bg-primary animate-blink inline-block shrink-0" />
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => {
                        setUserInput(e.target.value);
                        if (submitted) setSubmitted(false);
                      }}
                      onKeyDown={handleKeyDown}
                      className="absolute inset-0 w-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm"
                    />
                  </span>
                  <button
                    onClick={() => { if (userInput.trim()) setSubmitted(true); }}
                    className="shrink-0 font-mono text-[10px] px-2 py-1 rounded border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    Enter ↵
                  </button>
                </div>
                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="mt-4"
                    >
                      <Link href="/register">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="font-mono text-sm px-5 py-2.5 rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                        >
                          <span className="text-terminal-comment mr-1.5">$</span>
                          signup --register
                          <span className="text-muted-foreground ml-2">// Зарегистрироваться</span>
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
};

export default PossibilitiesSection;
