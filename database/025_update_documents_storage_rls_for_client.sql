-- ============================================================
-- Update RLS policies for documents storage bucket — allow client access
-- ============================================================

-- DROP old SELECT policy and create new one that includes client
DROP POLICY IF EXISTS documents_select ON storage.objects;

CREATE POLICY documents_select ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND name ~ '^orders/[^/]+/'
  AND (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_setting('app.current_user_id')::uuid
        AND u.role = 'owner'
    )
    OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = regexp_replace(name, '^orders/([^/]+)/.*', '\1')::uuid
        AND o.manager_user_id = current_setting('app.current_user_id')::uuid
    )
    OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = regexp_replace(name, '^orders/([^/]+)/.*', '\1')::uuid
        AND o.client_user_id = current_setting('app.current_user_id')::uuid
    )
  )
);

-- DROP old INSERT policy and create new one that includes client
DROP POLICY IF EXISTS documents_insert ON storage.objects;

CREATE POLICY documents_insert ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND name ~ '^orders/[^/]+/'
  AND (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_setting('app.current_user_id')::uuid
        AND u.role = 'owner'
    )
    OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = regexp_replace(name, '^orders/([^/]+)/.*', '\1')::uuid
        AND o.manager_user_id = current_setting('app.current_user_id')::uuid
    )
    OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = regexp_replace(name, '^orders/([^/]+)/.*', '\1')::uuid
        AND o.client_user_id = current_setting('app.current_user_id')::uuid
    )
  )
);
