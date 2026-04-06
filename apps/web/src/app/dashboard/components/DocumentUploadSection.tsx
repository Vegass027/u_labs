'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import type { Document } from '@/components/DocumentList'

interface DocumentUploadSectionProps {
  orderId: string
  initialDocuments: Document[]
  onDocumentsChange?: (documents: Document[]) => void
  currentUserId?: string
}

export function DocumentUploadSection({ orderId, initialDocuments, onDocumentsChange, currentUserId }: DocumentUploadSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canDeleteThis = (doc: Document) => {
    if (!currentUserId) return false
    return doc.uploaded_by === currentUserId
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setError('')
    setSuccess(false)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const { data: uploadData, error: apiError } = await api.upload<{ url: string; document: Document }>(`/api/orders/${orderId}/documents`, formData)

      clearInterval(progressInterval)
      setProgress(100)

      if (apiError) {
        setError(apiError)
        setTimeout(() => setError(''), 5000)
        return
      }

      if (uploadData?.document) {
        const newDocuments = [...documents, uploadData.document]
        setDocuments(newDocuments)
        onDocumentsChange?.(newDocuments)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('произошла ошибка при загрузке файла')
      setTimeout(() => setError(''), 5000)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDownload = (doc: Document) => {
    const link = window.document.createElement('a')
    link.href = doc.publicUrl
    link.download = doc.name
    link.click()
  }

  const handleDelete = async (doc: Document) => {
    const { error } = await api.delete(
      `/api/orders/${orderId}/documents/${encodeURIComponent(doc.path)}`
    )
    if (!error) {
      const newDocuments = documents.filter(d => d.path !== doc.path)
      setDocuments(newDocuments)
      onDocumentsChange?.(newDocuments)
    }
  }

  return (
    <div className="space-y-4">
      {/* Documents Grid */}
      <div className="flex items-start gap-2">
        {/* Upload Button - Universal */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full h-full rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary/50 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-yellow-400">{progress}%</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-primary group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-[10px] font-mono text-muted-foreground">загрузить</span>
              </>
            )}
          </button>
        </div>

        {/* Vertical Separator */}
        <div className="w-px h-20 bg-white/10 flex-shrink-0" />

        {/* Uploaded Documents */}
        <div className="flex flex-wrap gap-2">
          {documents.map((doc) => (
            <div key={doc.id} className="relative w-20 h-20 group">
              <button
                onClick={() => handleDownload(doc)}
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
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc) }}
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
      </div>

      {/* Hidden input for file upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileUpload(file)
          }
        }}
      />

      {/* Status messages */}
      {uploading && (
        <div className="text-xs font-mono text-yellow-400 px-3 py-2 rounded bg-yellow-500/10 border border-yellow-500/20">
          <span className="font-bold">[Uploading... {progress}%]</span>
        </div>
      )}

      {error && (
        <div className="text-xs font-mono text-red-400 px-3 py-2 rounded bg-red-500/10 border border-red-500/20">
          <span className="font-bold">[error]</span> {error}
        </div>
      )}

      {success && (
        <div className="text-xs font-mono text-green-500 px-3 py-2 rounded bg-green-500/10 border border-green-500/20">
          <span className="font-bold">[success]</span> файл загружен
        </div>
      )}
    </div>
  )
}
