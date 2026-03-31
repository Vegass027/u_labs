'use client'

import { useState } from 'react'
import { FolderIcon } from './FileIcon'
import { cn } from '@/lib/utils'

interface SidebarFolderProps {
  name: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarFolder({ name, children, defaultOpen = false }: SidebarFolderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-mono transition-colors',
          'hover:bg-[#2a2d2e]',
          'text-[#cccccc] hover:text-white',
          'w-full text-left'
        )}
      >
        <FolderIcon isOpen={isOpen} className="shrink-0 text-[#dcb67a]" />
        <span className="truncate">{name}</span>
        <span className="ml-auto text-[10px] text-[#858585]">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      {isOpen && (
        <div className="ml-4 flex flex-col gap-0.5 mt-0.5">
          {children}
        </div>
      )}
    </div>
  )
}
