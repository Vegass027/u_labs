-- ============================================================
-- Agency Platform — Manager Payment Details
-- PostgreSQL 15+
-- ============================================================

-- Добавляем поля для хранения реквизитов вывода средств в manager_profiles
ALTER TABLE manager_profiles
  ADD COLUMN IF NOT EXISTS sbp_phone TEXT,
  ADD COLUMN IF NOT EXISTS card_number TEXT,
  ADD COLUMN IF NOT EXISTS sbp_comment TEXT;

-- Комментарии для документации
COMMENT ON COLUMN manager_profiles.sbp_phone IS 'Номер телефона для СБП (Система быстрых платежей)';
COMMENT ON COLUMN manager_profiles.card_number IS 'Номер банковской карты для вывода средств';
COMMENT ON COLUMN manager_profiles.sbp_comment IS 'Комментарий для СБП (например, банк получателя)';
