'use client'

import { DocumentUploadSection } from '../../components/DocumentUploadSection'
import type { Document } from '@/components/DocumentList'
import { useRouter } from 'next/navigation'

interface DocumentsSectionProps {
  orderId: string
  initialDocuments: Document[]
}

export function DocumentsSection({ orderId, initialDocuments }: DocumentsSectionProps) {
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
    />
  )
}
