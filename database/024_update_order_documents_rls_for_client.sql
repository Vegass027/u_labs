-- ============================================================
-- Update RLS policies for order_documents — allow client access
-- ============================================================

-- DROP old INSERT policy and create new one that includes client
DROP POLICY IF EXISTS "Managers can insert documents for their orders" ON order_documents;

CREATE POLICY "Users can insert documents for their orders" ON order_documents
  FOR INSERT WITH CHECK (
    (EXISTS (SELECT 1 FROM orders o 
      WHERE o.id = order_documents.order_id 
      AND o.manager_user_id = auth.uid()))
    OR (auth.jwt() ->> 'role' = 'owner')
    OR (EXISTS (SELECT 1 FROM orders o 
      WHERE o.id = order_documents.order_id 
      AND o.client_user_id = auth.uid()))
  );

-- DROP old DELETE policy and create new one that includes client
DROP POLICY IF EXISTS "Managers can delete documents from their orders" ON order_documents;

CREATE POLICY "Users can delete documents" ON order_documents
  FOR DELETE USING (
    (EXISTS (SELECT 1 FROM orders o 
      WHERE o.id = order_documents.order_id 
      AND o.manager_user_id = auth.uid()))
    OR (auth.jwt() ->> 'role' = 'owner')
    OR (uploaded_by = auth.uid())
  );
