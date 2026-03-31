'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { VscClose } from 'react-icons/vsc'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  filename: string
  href: string
}

interface TabBarProps {
  tabs: Tab[]
  onCloseTab?: (tabId: string) => void
}

export function TabBar({ tabs, onCloseTab }: TabBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>(pathname)

  useEffect(() => {
    setActiveTab(pathname)
  }, [pathname])

  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-card/50 border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => {
            if (tab.href !== pathname) {
              router.push(tab.href)
            }
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 text-sm font-mono rounded-t transition-colors cursor-pointer',
            'min-w-max',
            activeTab === tab.href
              ? 'bg-background text-foreground border-t-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          <span className="truncate">{tab.filename}</span>
          {onCloseTab && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCloseTab(tab.id)
              }}
              className={cn(
                'flex items-center justify-center w-4 h-4 rounded hover:bg-muted-foreground/20',
                'transition-colors',
                activeTab === tab.href && 'hover:bg-foreground/20'
              )}
            >
              <VscClose className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
