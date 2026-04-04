-- Add service role policy for order_documents table
-- This allows the backend service role to have full access to order_documents

CREATE POLICY "Service role has full access to order_documents"
ON public.order_documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
