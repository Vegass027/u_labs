-- ============================================================
-- Industry Contexts — контекст ниш для AI-ассистента
-- ============================================================

-- Таблица ниш
CREATE TABLE IF NOT EXISTS industry_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  pains TEXT NOT NULL,
  roles TEXT NOT NULL,
  processes TEXT NOT NULL,
  integrations TEXT NOT NULL,
  metrics TEXT NOT NULL,
  first_release TEXT NOT NULL,
  misconceptions TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индекс для поиска по ключевым словам
CREATE INDEX IF NOT EXISTS idx_industry_contexts_keywords 
  ON industry_contexts USING GIN(keywords);

-- Индекс для фильтрации активных ниш
CREATE INDEX IF NOT EXISTS idx_industry_contexts_active 
  ON industry_contexts(is_active) WHERE is_active = true;

-- Поле для определённой ниши в заказе
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES industry_contexts(id) ON DELETE SET NULL;

-- Индекс для быстрого поиска заказов по нише
CREATE INDEX IF NOT EXISTS idx_orders_industry 
  ON orders(industry_id) WHERE industry_id IS NOT NULL;

-- Триггер updated_at для industry_contexts
CREATE TRIGGER trg_industry_contexts_updated_at
  BEFORE UPDATE ON industry_contexts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE industry_contexts ENABLE ROW LEVEL SECURITY;

-- Все авторизованные пользователи могут видеть активные ниши
CREATE POLICY industry_contexts_view_active ON industry_contexts
  FOR SELECT
  USING (is_active = true);

-- Только owner может создавать, обновлять и удалять ниши
CREATE POLICY industry_contexts_owner_manage ON industry_contexts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id')::uuid 
        AND role = 'owner'
    )
  );
