-- ============================================================
-- Update documents bucket — add support for Office documents and images
-- ============================================================

UPDATE storage.buckets
SET 
  allowed_mime_types = ARRAY[
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp'
  ],
  file_size_limit = 10485760
WHERE id = 'documents';
