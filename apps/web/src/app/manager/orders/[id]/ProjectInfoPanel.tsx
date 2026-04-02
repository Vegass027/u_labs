'use client'

import { DocumentList, Document } from '@/app/manager/components/DocumentList'

interface ProjectInfoPanelProps {
  price: number | null
  documents: Document[]
  orderId: string
}

export function ProjectInfoPanel({ price, documents, orderId }: ProjectInfoPanelProps) {
  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card/70 backdrop-blur-md terminal-glow">
      {price ? (
        <div className="px-4 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💰</span>
            <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              Сумма проекта
            </h3>
          </div>
          <div className="text-2xl font-bold text-primary font-mono">
            {price.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💰</span>
            <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              Сумма проекта
            </h3>
          </div>
          <div className="text-2xl font-bold text-muted-foreground font-mono">
            ?
          </div>
        </div>
      )}

      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📎</span>
          <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            Документы по проекту
          </h3>
        </div>
        <DocumentList documents={documents} onDownload={handleDownload} />
      </div>
    </div>
  )
}
