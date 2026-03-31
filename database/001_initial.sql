-- ============================================================
-- Agency Platform — Database Schema
-- PostgreSQL 15+
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('owner', 'manager', 'client');

CREATE TYPE order_status AS ENUM (
  'new',
  'reviewing',
  'proposal_sent',
  'contract_signed',
  'in_development',
  'done',
  'rejected'
);

CREATE TYPE commission_status AS ENUM (
  'reserved',
  'payable',
  'paid'
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  role              user_role NOT NULL DEFAULT 'client',
  full_name         TEXT NOT NULL,
  phone             TEXT,
  telegram_chat_id  TEXT UNIQUE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_role     ON users (role);
CREATE INDEX idx_users_telegram ON users (telegram_chat_id);

-- ============================================================
-- MANAGER PROFILES
-- ============================================================

CREATE TABLE manager_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance_reserved  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance_payable   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance_paid      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_orders      INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_manager_profiles_user ON manager_profiles (user_id);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Кто создал заявку
  client_user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  manager_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Основное
  title               TEXT NOT NULL,
  status              order_status NOT NULL DEFAULT 'new',

  -- Финансы
  price               NUMERIC(12, 2),
  manager_commission  NUMERIC(12, 2),

  -- Входные данные (сырые)
  raw_text            TEXT,
  audio_url           TEXT,
  transcript          TEXT,

  -- Структурированный бриф от LLM (jsonb для гибкости)
  structured_brief    JSONB,

  -- Мета
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Хотя бы один источник должен быть
  CONSTRAINT orders_has_source CHECK (
    client_user_id IS NOT NULL OR manager_user_id IS NOT NULL
  )
);

CREATE INDEX idx_orders_client     ON orders (client_user_id);
CREATE INDEX idx_orders_manager    ON orders (manager_user_id);
CREATE INDEX idx_orders_status     ON orders (status);
CREATE INDEX idx_orders_created    ON orders (created_at DESC);
CREATE INDEX idx_orders_brief_gin  ON orders USING GIN (structured_brief);

-- ============================================================
-- ORDER MESSAGES (чат)
-- ============================================================

CREATE TABLE order_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_order   ON order_messages (order_id, created_at ASC);
CREATE INDEX idx_messages_sender  ON order_messages (sender_id);

-- ============================================================
-- COMMISSION TRANSACTIONS
-- ============================================================

CREATE TABLE commission_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  manager_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          NUMERIC(12, 2) NOT NULL,
  tx_status       commission_status NOT NULL DEFAULT 'reserved',
  note            TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commissions_manager ON commission_transactions (manager_user_id);
CREATE INDEX idx_commissions_order   ON commission_transactions (order_id);
CREATE INDEX idx_commissions_status  ON commission_transactions (tx_status);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user    ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_order   ON notifications (order_id);

-- ============================================================
-- REFRESH TOKENS (auth)
-- ============================================================

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_manager_profiles_updated_at
  BEFORE UPDATE ON manager_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_commissions_updated_at
  BEFORE UPDATE ON commission_transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Автосоздание manager_profile при регистрации менеджера
CREATE OR REPLACE FUNCTION create_manager_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'manager' THEN
    INSERT INTO manager_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_manager_profile
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW EXECUTE FUNCTION create_manager_profile();

-- При выставлении цены — автосоздание commission_transaction
CREATE OR REPLACE FUNCTION create_commission_on_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Только если цена появилась или изменилась, и есть менеджер
  IF NEW.price IS NOT NULL AND NEW.manager_user_id IS NOT NULL
     AND (OLD.price IS NULL OR OLD.price <> NEW.price) THEN

    -- Удаляем старую reserved (если была)
    DELETE FROM commission_transactions
    WHERE order_id = NEW.id AND tx_status = 'reserved';

    -- Создаём новую
    INSERT INTO commission_transactions (order_id, manager_user_id, amount, tx_status)
    VALUES (NEW.id, NEW.manager_user_id, NEW.manager_commission, 'reserved');

    -- Обновляем баланс менеджера
    UPDATE manager_profiles
    SET balance_reserved = (
      SELECT COALESCE(SUM(amount), 0)
      FROM commission_transactions
      WHERE manager_user_id = NEW.manager_user_id AND tx_status = 'reserved'
    )
    WHERE user_id = NEW.manager_user_id;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_commission_on_price
  AFTER UPDATE OF price ON orders
  FOR EACH ROW EXECUTE FUNCTION create_commission_on_price();

-- При смене статуса commission — обновить балансы менеджера
CREATE OR REPLACE FUNCTION sync_manager_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE manager_profiles
  SET
    balance_reserved = (
      SELECT COALESCE(SUM(amount), 0)
      FROM commission_transactions
      WHERE manager_user_id = NEW.manager_user_id AND tx_status = 'reserved'
    ),
    balance_payable = (
      SELECT COALESCE(SUM(amount), 0)
      FROM commission_transactions
      WHERE manager_user_id = NEW.manager_user_id AND tx_status = 'payable'
    ),
    balance_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM commission_transactions
      WHERE manager_user_id = NEW.manager_user_id AND tx_status = 'paid'
    )
  WHERE user_id = NEW.manager_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_balance
  AFTER INSERT OR UPDATE OF tx_status ON commission_transactions
  FOR EACH ROW EXECUTE FUNCTION sync_manager_balance();

-- Счётчик заказов у менеджера
CREATE OR REPLACE FUNCTION increment_manager_order_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.manager_user_id IS NOT NULL AND NEW.status = 'done' THEN
    UPDATE manager_profiles
    SET total_orders = total_orders + 1
    WHERE user_id = NEW.manager_user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_manager_order_count
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done'))
  EXECUTE FUNCTION increment_manager_order_count();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_profiles ENABLE ROW LEVEL SECURITY;

-- Owner видит всё
CREATE POLICY orders_owner_all ON orders
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'owner')
  );

-- Менеджер видит только свои заявки
CREATE POLICY orders_manager_own ON orders
  USING (manager_user_id = current_setting('app.current_user_id')::uuid);

-- Клиент видит только свои заявки
CREATE POLICY orders_client_own ON orders
  USING (client_user_id = current_setting('app.current_user_id')::uuid);

-- Менеджер видит только свой профиль
CREATE POLICY manager_profiles_own ON manager_profiles
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Сообщения — только участники заказа
CREATE POLICY messages_participants ON order_messages
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (
          o.client_user_id  = current_setting('app.current_user_id')::uuid OR
          o.manager_user_id = current_setting('app.current_user_id')::uuid OR
          EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'owner')
        )
    )
  );

-- Уведомления — только свои
CREATE POLICY notifications_own ON notifications
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Комиссии — менеджер видит только свои, owner все
CREATE POLICY commissions_access ON commission_transactions
  USING (
    manager_user_id = current_setting('app.current_user_id')::uuid OR
    EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'owner')
  );

-- ============================================================
-- SEED: владелец
-- ============================================================

-- Пароль нужно заменить на bcrypt-хеш при деплое
INSERT INTO users (email, password_hash, role, full_name)
VALUES ('owner@agency.dev', 'REPLACE_WITH_BCRYPT_HASH', 'owner', 'Agency Owner')
ON CONFLICT (email) DO NOTHING;