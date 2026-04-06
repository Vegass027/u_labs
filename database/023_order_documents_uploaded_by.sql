-- ============================================================
-- Add uploaded_by field to order_documents
-- ============================================================

-- Add uploaded_by column
ALTER TABLE order_documents
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id);

-- Update existing documents with manager_user_id as uploaded_by
UPDATE order_documents 
SET uploaded_by = (
  SELECT manager_user_id FROM orders 
  WHERE orders.id = order_documents.order_id
) WHERE uploaded_by IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_order_documents_uploaded_by 
  ON order_documents(uploaded_by);
