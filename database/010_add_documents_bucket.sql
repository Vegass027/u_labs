-- ============================================================
-- Documents Bucket — хранение txt/md файлов для AI-чата
-- ============================================================

-- Создание бакета для документов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  1048576, -- 1MB
  ARRAY['text/plain', 'text/markdown', 'text/x-markdown']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Включаем RLS только если он ещё не включён
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND rowsecurity = true
  ) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Политика на чтение документов
DROP POLICY IF EXISTS documents_select ON storage.objects;
CREATE POLICY documents_select ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND name ~ '^orders/[^/]+/'
  AND (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = regexp_replace(name, '^orders/([^/]+)/.*', '\1')::uuid
        AND o.manager_user_id = current_setting('app.current_user_id')::uuid
    )
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_setting('app.current_user_id')::uuid
        AND u.role = 'owner'
    )
  )
);

-- Политика на загрузку документов
DROP POLICY IF EXISTS documents_insert ON storage.objects;
CREATE POLICY documents_insert ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND name ~ '^orders/[^/]+/'
  AND (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = regexp_replace(name, '^orders/([^/]+)/.*', '\1')::uuid
        AND o.manager_user_id = current_setting('app.current_user_id')::uuid
    )
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_setting('app.current_user_id')::uuid
        AND u.role = 'owner'
    )
  )
);
