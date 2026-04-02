'use client'

import { FileIcon } from './FileIcon'
import { cn } from '@/lib/utils'

export interface Document {
  name: string
  id: string
  size: number
  created_at: string
  publicUrl: string
}

interface DocumentListProps {
  documents: Document[]
  onDownload?: (url: string, name: string) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function DocumentList({ documents, onDownload }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-muted-foreground text-sm font-mono">
        // документов пока нет
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
        >
          <FileIcon filename={doc.name} className="text-primary" />
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium font-mono truncate">
              {doc.name}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {formatFileSize(doc.size)} • {formatDate(doc.created_at)}
            </div>
          </div>

          <button
            onClick={() => onDownload?.(doc.publicUrl, doc.name)}
            className="px-3 py-1.5 text-xs font-mono rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100"
          >
            скачать
          </button>
        </div>
      ))}
    </div>
  )
}
