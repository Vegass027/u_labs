'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Tab {
  id: string
  label: string
  icon: string
}

const defaultTabs: Tab[] = [
  { id: "hero", label: "index.tsx", icon: "⚡" },
  { id: "pain", label: "problem.ts", icon: "🔴" },
  { id: "solution", label: "solution.ts", icon: "💡" },
  { id: "how", label: "pipeline.ts", icon: "🤖" },
  { id: "comm", label: "chat.tsx", icon: "💬" },
  { id: "managers", label: "earn.ts", icon: "💰" },
  { id: "devs", label: "orders.ts", icon: "🧑‍💻" },
]

const TITLE_TEXT = "Union Labs - Development Studio"

interface VSCodeHeaderProps {
  tabs?: Tab[]
  defaultActiveTab?: string
}

const VSCodeHeader = ({ tabs = defaultTabs, defaultActiveTab }: VSCodeHeaderProps) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || "hero")
  const [displayedTitle, setDisplayedTitle] = useState("")

  useEffect(() => {
    let index = 0
    let phase: "typing" | "visible" | "fading" | "empty" = "typing"
    let timeout: ReturnType<typeof setTimeout> | null = null

    const tick = () => {
      if (phase === "typing") {
        if (index <= TITLE_TEXT.length) {
          setDisplayedTitle(TITLE_TEXT.slice(0, index))
          index++
        } else {
          phase = "visible"
          timeout = setTimeout(tick, 3000)
          return
        }
        timeout = setTimeout(tick, 60)
      } else if (phase === "visible") {
        phase = "fading"
        setDisplayedTitle("")
        timeout = setTimeout(tick, 500)
      } else if (phase === "fading") {
        phase = "empty"
        timeout = setTimeout(tick, 400)
      } else if (phase === "empty") {
        index = 0
        phase = "typing"
        timeout = setTimeout(tick, 60)
      }
    }

    timeout = setTimeout(tick, 60)
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const handleTabClick = (id: string) => {
    setActiveTab(id)
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Top bar — like VS Code title bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-terminal-header">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(0 70% 55%)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(40 80% 55%)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(120 60% 45%)" }} />
          </div>
          <Link href="/" className="font-mono text-xs text-primary hover:text-glow-sm transition-colors inline-flex items-center">
            {displayedTitle}
            <span className="w-1.5 h-3.5 bg-primary animate-blink inline-block ml-0.5" />
          </Link>
        </div>
        <Link href="/login">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="font-mono text-xs px-4 py-1.5 rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="text-terminal-comment mr-1.5">$</span>
            login --auth
          </motion.button>
        </Link>
      </div>

      {/* Tabs bar — like VS Code file tabs */}
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              relative flex items-center gap-1.5 px-4 py-2 font-mono text-xs whitespace-nowrap border-r border-border transition-colors shrink-0
              ${activeTab === tab.id
                ? "bg-card text-foreground"
                : "bg-terminal-header text-muted-foreground hover:text-foreground/70"
              }
            `}
          >
            <span className="text-[10px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute top-0 left-0 right-0 h-[2px] bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>
    </header>
  )
}

export default VSCodeHeader
