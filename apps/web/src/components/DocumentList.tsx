'use client'

import { DocumentUploadSection } from '@/app/dashboard/components/DocumentUploadSection'

export interface Document {
  name: string
  path: string
  id: string
  size: number
  created_at: string | null
  updated_at: string | null
  publicUrl: string
  uploaded_by?: string | null
}

interface DocumentListProps {
  documents: Document[]
  onDownload?: (url: string, name: string) => void
  canDelete?: boolean
  currentUserId?: string
  onDelete?: (doc: Document) => void
  orderId?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function DocumentList({ documents, onDownload, canDelete = false, currentUserId, onDelete, orderId }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-muted-foreground text-sm font-mono">
        // документов пока нет
      </div>
    )
  }

  const canDeleteThis = (doc: Document) => {
    if (!canDelete) return false
    if (!currentUserId) return true
    return doc.uploaded_by === currentUserId
  }

  if (currentUserId) {
    const teamFiles = documents.filter(d => d.uploaded_by !== currentUserId)
    const myFiles = documents.filter(d => d.uploaded_by === currentUserId)

    return (
      <div className="flex gap-4">
        {teamFiles.length > 0 && (
          <div className="flex-1 space-y-3">
            <p className="text-xs text-muted-foreground font-mono mb-2">
              // файлы от команды
            </p>
            <div className="flex flex-wrap gap-2">
              {teamFiles.map((doc) => (
                <div key={doc.id} className="relative w-20 h-20 group">
                  <button
                    onClick={() => onDownload?.(doc.publicUrl, doc.name)}
                    className="w-full h-full rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-1 p-1.5"
                  >
                    <svg className="w-5 h-5 text-primary group-hover:text-green-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[10px] font-mono text-muted-foreground truncate w-full text-center leading-tight">
                      {doc.name}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="w-px bg-border/50"></div>
        {currentUserId && orderId && (
          <div className="flex-1 space-y-3">
            <p className="text-xs text-muted-foreground font-mono mb-2">
              // ваши файлы
            </p>
            <DocumentUploadSection orderId={orderId} initialDocuments={myFiles} currentUserId={currentUserId} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {documents.map((doc) => (
        <div key={doc.id} className="relative w-20 h-20 group">
          <button
            onClick={() => onDownload?.(doc.publicUrl, doc.name)}
            className="w-full h-full rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-1 p-1.5"
          >
            <svg className="w-5 h-5 text-primary group-hover:text-green-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] font-mono text-muted-foreground truncate w-full text-center leading-tight">
              {doc.name}
            </span>
          </button>
          {canDeleteThis(doc) && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(doc) }}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center transition-opacity hover:bg-red-600 shadow-sm"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
