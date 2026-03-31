-- ============================================================
-- Add client contact fields to orders table
-- ============================================================

-- Add client_name and client_contact fields to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_contact TEXT;

-- Add index for faster lookups by client_contact (email)
CREATE INDEX IF NOT EXISTS idx_orders_client_contact ON orders(client_contact);

-- Add comment to document the purpose
COMMENT ON COLUMN orders.client_name IS 'Client name/company (filled by manager before registration)';
COMMENT ON COLUMN orders.client_contact IS 'Client email (filled by manager, used for linking after registration)';
