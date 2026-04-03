-- ============================================================
-- Attachments Bucket — хранение аватаров и файлов
-- ============================================================

-- Создание бакета для вложений
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
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

-- Политика на чтение аватаров (public)
DROP POLICY IF EXISTS attachments_select ON storage.objects;
CREATE POLICY attachments_select ON storage.objects
FOR SELECT
USING (
  bucket_id = 'attachments'
  AND name ~ '^avatars/'
);

-- Политика на загрузку аватаров (только владелец)
DROP POLICY IF EXISTS attachments_insert ON storage.objects;
CREATE POLICY attachments_insert ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'attachments'
  AND name ~ '^avatars/[^/]+/'
  AND regexp_replace(name, '^avatars/([^/]+)/.*', '\1') = current_setting('app.current_user_id')::text
);

-- Политика на удаление аватаров (только владелец)
DROP POLICY IF EXISTS attachments_delete ON storage.objects;
CREATE POLICY attachments_delete ON storage.objects
FOR DELETE
USING (
  bucket_id = 'attachments'
  AND name ~ '^avatars/[^/]+/'
  AND regexp_replace(name, '^avatars/([^/]+)/.*', '\1') = current_setting('app.current_user_id')::text
);

-- Политика на обновление аватаров (только владелец, для upsert)
DROP POLICY IF EXISTS attachments_update ON storage.objects;
CREATE POLICY attachments_update ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'attachments'
  AND name ~ '^avatars/[^/]+/'
  AND regexp_replace(name, '^avatars/([^/]+)/.*', '\1') = current_setting('app.current_user_id')::text
);
