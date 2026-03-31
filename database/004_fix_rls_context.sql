-- ============================================================
-- Migration 004: Fix RLS policies — NULLIF protection
-- Fixes: invalid input syntax for type uuid: ""
-- Apply in: Supabase SQL Editor
-- ============================================================

-- ── ORDERS ──────────────────────────────────────────────────

DROP POLICY IF EXISTS orders_owner_all        ON orders;
DROP POLICY IF EXISTS orders_manager_own      ON orders;
DROP POLICY IF EXISTS orders_client_own       ON orders;
DROP POLICY IF EXISTS orders_client_insert    ON orders;
DROP POLICY IF EXISTS orders_manager_insert   ON orders;
DROP POLICY IF EXISTS orders_owner_insert     ON orders;
DROP POLICY IF EXISTS orders_owner_update     ON orders;
DROP POLICY IF EXISTS orders_manager_update   ON orders;
DROP POLICY IF EXISTS orders_client_update    ON orders;

CREATE POLICY orders_owner_all ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      AND role = 'owner'
    )
  );

CREATE POLICY orders_manager_own ON orders
  FOR SELECT USING (
    manager_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

CREATE POLICY orders_client_own ON orders
  FOR SELECT USING (
    client_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

CREATE POLICY orders_client_insert ON orders
  FOR INSERT WITH CHECK (
    client_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

CREATE POLICY orders_manager_insert ON orders
  FOR INSERT WITH CHECK (
    manager_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

CREATE POLICY orders_owner_insert ON orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      AND role = 'owner'
    )
  );

CREATE POLICY orders_owner_update ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      AND role = 'owner'
    )
  );

CREATE POLICY orders_manager_update ON orders
  FOR UPDATE USING (
    manager_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

-- ── ORDER_MESSAGES ───────────────────────────────────────────

DROP POLICY IF EXISTS messages_participants ON order_messages;
DROP POLICY IF EXISTS messages_insert       ON order_messages;

CREATE POLICY messages_participants ON order_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND (
        o.client_user_id  = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        OR
        o.manager_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        OR
        EXISTS (
          SELECT 1 FROM users
          WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
          AND role = 'owner'
        )
      )
    )
  );

CREATE POLICY messages_insert ON order_messages
  FOR INSERT WITH CHECK (
    sender_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND (
        o.client_user_id  = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        OR
        o.manager_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        OR
        EXISTS (
          SELECT 1 FROM users
          WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
          AND role = 'owner'
        )
      )
    )
  );

-- ── NOTIFICATIONS ────────────────────────────────────────────

DROP POLICY IF EXISTS notifications_own    ON notifications;
DROP POLICY IF EXISTS notifications_insert ON notifications;

CREATE POLICY notifications_own ON notifications
  FOR SELECT USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

-- ── COMMISSION_TRANSACTIONS ──────────────────────────────────

DROP POLICY IF EXISTS commissions_access ON commission_transactions;

CREATE POLICY commissions_select ON commission_transactions
  FOR SELECT USING (
    manager_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      AND role = 'owner'
    )
  );

CREATE POLICY commissions_insert ON commission_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY commissions_update ON commission_transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      AND role = 'owner'
    )
  );

-- ── MANAGER_PROFILES ────────────────────────────────────────

DROP POLICY IF EXISTS manager_profiles_own ON manager_profiles;

CREATE POLICY manager_profiles_select ON manager_profiles
  FOR SELECT USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      AND role = 'owner'
    )
  );

CREATE POLICY manager_profiles_insert ON manager_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY manager_profiles_update ON manager_profiles
  FOR UPDATE USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      AND role = 'owner'
    )
  );

-- ── REFRESH_TOKENS ───────────────────────────────────────────

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS refresh_tokens_own ON refresh_tokens;

CREATE POLICY refresh_tokens_own ON refresh_tokens
  FOR ALL USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );
