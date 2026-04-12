'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"

const STATUS_LINES = [
  "// набор в команду пока закрыт",
  "// но мы растём — и скоро понадобятся руки",
]

const TYPING_TEXT = "COMING SOON"

const DevComingSoonBlock = () => {
  const [displayedTitle, setDisplayedTitle] = useState("")
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    let lineIdx = 0
    let charIdx = 0
    let timeout: ReturnType<typeof setTimeout> | null = null

    const typeComment = () => {
      if (lineIdx >= STATUS_LINES.length) {
        setShowPrompt(true)
        return
      }
      const line = STATUS_LINES[lineIdx]
      if (charIdx <= line.length) {
        const currentLines = [...STATUS_LINES.slice(0, lineIdx), line.slice(0, charIdx)]
        setDisplayedLines([...currentLines])
        charIdx++
        timeout = setTimeout(typeComment, 25)
      } else {
        lineIdx++
        charIdx = 0
        timeout = setTimeout(typeComment, 400)
      }
    }

    timeout = setTimeout(typeComment, 600)
    return () => { if (timeout) clearTimeout(timeout) }
  }, [])

  useEffect(() => {
    let index = 0
    let phase: "typing" | "visible" | "fading" | "empty" = "typing"
    let timeout: ReturnType<typeof setTimeout> | null = null

    const tick = () => {
      if (phase === "typing") {
        if (index <= TYPING_TEXT.length) {
          setDisplayedTitle(TYPING_TEXT.slice(0, index))
          index++
        } else {
          phase = "visible"
          timeout = setTimeout(tick, 4000)
          return
        }
        timeout = setTimeout(tick, 80)
      } else if (phase === "visible") {
        phase = "fading"
        setDisplayedTitle("")
        timeout = setTimeout(tick, 600)
      } else if (phase === "fading") {
        phase = "empty"
        timeout = setTimeout(tick, 500)
      } else if (phase === "empty") {
        index = 0
        phase = "typing"
        timeout = setTimeout(tick, 80)
      }
    }

    timeout = setTimeout(tick, 800)
    return () => { if (timeout) clearTimeout(timeout) }
  }, [])

  return (
    <section id="dev-status" className="relative py-20 md:py-28 px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <TerminalWindow title="~/dev-mode — recruitment">
            <div className="space-y-4">
              {displayedLines.map((line, i) => (
                <div key={i} className="text-terminal-comment text-xs">
                  {line}
                </div>
              ))}

              <div className="h-2" />

              <div className="flex items-center gap-2">
                <span className="text-terminal-prompt">{'>'}</span>
                <span className="text-foreground text-sm">status --recruitment</span>
              </div>

              {/* Фиксированная высота для COMING SOON — предотвращает прыжок формы */}
              <div className="h-[120px] sm:h-[140px] md:h-[160px] flex items-center justify-center">
                <div className="flex items-center">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-primary text-glow tracking-[0.3em]">
                    {displayedTitle}
                  </span>
                  {/* Мигающий курсор — всегда виден */}
                  <span className="w-2 h-8 sm:h-10 md:h-12 bg-primary animate-blink inline-block ml-1" />
                </div>
              </div>

              {showPrompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-2"
                >
                  <div className="text-sm text-foreground">
                    <span className="text-terminal-prompt">{'>'}</span>{" "}
                    Когда откроется — вы получите уведомление.
                  </div>
                  <div className="text-sm text-foreground">
                    <span className="text-terminal-prompt">{'>'}</span>{" "}
                    Оставьте контакты{" "}
                    <a href="#dev-form" className="text-primary hover:text-glow-sm transition-colors underline underline-offset-4">
                      в форме ниже
                    </a>.
                  </div>
                </motion.div>
              )}
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default DevComingSoonBlock
