-- ============================================================
-- Migration 005: Fix RLS policies to use auth.uid() instead of current_setting
-- This fixes frontend direct access to Supabase with anon key
-- ============================================================

-- ── ORDERS ──────────────────────────────────────────────────

CREATE POLICY orders_owner_all ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY orders_manager_own ON orders
  FOR SELECT USING (manager_user_id = auth.uid());

CREATE POLICY orders_client_own ON orders
  FOR SELECT USING (client_user_id = auth.uid());

CREATE POLICY orders_client_insert ON orders
  FOR INSERT WITH CHECK (client_user_id = auth.uid());

CREATE POLICY orders_manager_insert ON orders
  FOR INSERT WITH CHECK (manager_user_id = auth.uid());

CREATE POLICY orders_owner_insert ON orders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY orders_owner_update ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY orders_manager_update ON orders
  FOR UPDATE USING (manager_user_id = auth.uid());

-- ── ORDER_MESSAGES ───────────────────────────────────────────

CREATE POLICY messages_participants ON order_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND (
        o.client_user_id  = auth.uid()
        OR
        o.manager_user_id = auth.uid()
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
      )
    )
  );

CREATE POLICY messages_insert ON order_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND (
        o.client_user_id  = auth.uid()
        OR
        o.manager_user_id = auth.uid()
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
      )
    )
  );

-- ── NOTIFICATIONS ────────────────────────────────────────────

CREATE POLICY notifications_own ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ── COMMISSION_TRANSACTIONS ──────────────────────────────────

CREATE POLICY commissions_select ON commission_transactions
  FOR SELECT USING (
    manager_user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY commissions_insert ON commission_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY commissions_update ON commission_transactions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

-- ── MANAGER_PROFILES ────────────────────────────────────────

CREATE POLICY manager_profiles_select ON manager_profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY manager_profiles_insert ON manager_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY manager_profiles_update ON manager_profiles
  FOR UPDATE USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

-- ── REFRESH_TOKENS ───────────────────────────────────────────

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY refresh_tokens_own ON refresh_tokens
  FOR ALL USING (user_id = auth.uid());
