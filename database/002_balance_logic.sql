-- ============================================================
-- Agency Platform — Balance & Withdrawals Logic
-- PostgreSQL 15+
-- ============================================================

-- ============================================================
-- TRIGGERS: Commission Status Transitions
-- ============================================================

-- Триггер: перевод reserved → payable при статусе 'done'
CREATE OR REPLACE FUNCTION commission_to_payable_on_done()
RETURNS TRIGGER AS $$
BEGIN
  -- Когда статус заказа меняется на 'done'
  IF NEW.status = 'done' AND OLD.status IS DISTINCT FROM 'done' THEN
    -- Переводим комиссию из reserved в payable
    UPDATE commission_transactions
    SET tx_status = 'payable', updated_at = NOW()
    WHERE order_id = NEW.id AND tx_status = 'reserved';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_commission_to_payable_on_done
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done'))
  EXECUTE FUNCTION commission_to_payable_on_done();

-- ============================================================
-- WITHDRAWAL REQUESTS TABLE
-- ============================================================

CREATE TABLE withdrawal_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note            TEXT,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_manager ON withdrawal_requests(manager_user_id);
CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status);

-- Автообновление updated_at для withdrawal_requests
CREATE TRIGGER trg_withdrawals_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Менеджер видит только свои запросы
CREATE POLICY withdrawals_manager_own ON withdrawal_requests
  FOR ALL
  TO authenticated
  USING (manager_user_id = current_setting('app.current_user_id', true)::uuid);

-- Владелец видит все запросы
CREATE POLICY withdrawals_owner_all ON withdrawal_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('app.current_user_id', true)::uuid
      AND role = 'owner'
    )
  );
