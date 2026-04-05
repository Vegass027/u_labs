'use client'

import { VscFile, VscFileCode, VscFilePdf, VscFolder, VscFolderOpened } from 'react-icons/vsc'
import { cn } from '@/lib/utils'

interface FileIconProps {
  filename: string
  isOpen?: boolean
  className?: string
}

export function FileIcon({ filename, isOpen, className }: FileIconProps) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'ts': VscFileCode,
    'tsx': VscFileCode,
    'json': VscFileCode,
    'js': VscFileCode,
    'jsx': VscFileCode,
    'pdf': VscFilePdf,
  }

  const Icon = iconMap[ext] || VscFile

  return <Icon className={cn('w-4 h-4', className)} />
}

interface FolderIconProps {
  isOpen?: boolean
  className?: string
}

export function FolderIcon({ isOpen, className }: FolderIconProps) {
  const Icon = isOpen ? VscFolderOpened : VscFolder
  return <Icon className={cn('w-4 h-4', className)} />
}
