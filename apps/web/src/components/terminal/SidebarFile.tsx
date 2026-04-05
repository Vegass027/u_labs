'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileIcon } from './FileIcon'
import { cn } from '@/lib/utils'

interface SidebarFileProps {
  filename: string
  href: string
  onClick?: () => void
}

export function SidebarFile({ filename, href, onClick }: SidebarFileProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-mono transition-colors',
        'hover:bg-muted/50',
        isActive && 'bg-muted text-primary',
        !isActive && 'text-muted-foreground'
      )}
    >
      <FileIcon filename={filename} className={cn(
        'shrink-0',
        isActive ? 'text-primary' : 'text-primary/70'
      )} />
      <span className="truncate">{filename}</span>
    </Link>
  )
}
