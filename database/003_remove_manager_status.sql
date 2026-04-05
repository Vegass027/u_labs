-- ============================================================
-- Remove manager_status column and type
-- ============================================================

-- Drop the manager_status column from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS manager_status;

-- Drop the manager_status enum type
DROP TYPE IF EXISTS manager_status;
