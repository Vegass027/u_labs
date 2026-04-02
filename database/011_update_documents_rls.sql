-- ============================================================
-- Update Documents RLS Policies — Owner и Manager доступ
-- ============================================================

-- Включаем RLS если ещё не включён
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

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS documents_select ON storage.objects;
DROP POLICY IF EXISTS documents_insert ON storage.objects;

-- Политика для чтения документов — Owner видит все, Manager только свои заказы
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
  )
);

-- Политика для загрузки документов — Owner и Manager своих заказов
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
  )
);
