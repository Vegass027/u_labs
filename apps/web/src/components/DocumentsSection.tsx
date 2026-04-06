'use client'

import { DocumentUploadSection } from '@/app/dashboard/components/DocumentUploadSection'
import type { Document } from '@/components/DocumentList'
import { useRouter } from 'next/navigation'

interface DocumentsSectionProps {
  orderId: string
  initialDocuments: Document[]
  currentUserId?: string
}

export function DocumentsSection({ orderId, initialDocuments, currentUserId }: DocumentsSectionProps) {
  const router = useRouter()

  const handleDocumentsChange = (documents: Document[]) => {
    // Refresh to get updated documents list
    router.refresh()
  }

  return (
    <DocumentUploadSection
      orderId={orderId}
      initialDocuments={initialDocuments}
      onDocumentsChange={handleDocumentsChange}
      currentUserId={currentUserId}
    />
  )
}
