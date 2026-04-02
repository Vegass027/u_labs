-- Add manager status enum and field to orders table

-- Create enum type for manager status
CREATE TYPE manager_status AS ENUM ('brief_ready', 'negotiation', 'contract', 'cancelled');

-- Add manager_status column to orders table
ALTER TABLE orders
  ADD COLUMN manager_status manager_status;

-- Add comment to document the purpose
COMMENT ON COLUMN orders.manager_status IS 'Статус работы менеджера с клиентом: brief_ready - Бриф готов, negotiation - Переговоры, contract - Договор, cancelled - Отклонён';
