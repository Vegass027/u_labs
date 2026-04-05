-- ============================================================
-- Agency Platform — Add Message Type to Order Messages
-- ============================================================

-- Create ENUM for message types
CREATE TYPE message_type AS ENUM ('client_manager', 'manager_owner');

-- Add message_type column to order_messages
ALTER TABLE order_messages 
ADD COLUMN message_type message_type NOT NULL DEFAULT 'client_manager';

-- Add index for filtering by message type
CREATE INDEX idx_messages_type ON order_messages (order_id, message_type, created_at ASC);

-- Drop existing RLS policy
DROP POLICY IF EXISTS messages_participants ON order_messages;

-- Create new RLS policy with message type filtering
-- Owner sees ALL messages, client sees only client_manager, manager sees both
CREATE POLICY messages_participants ON order_messages
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (
          -- Client sees only client_manager messages
          (o.client_user_id = current_setting('app.current_user_id', true)::uuid AND message_type = 'client_manager') OR
          -- Manager sees both message types
          (o.manager_user_id = current_setting('app.current_user_id', true)::uuid) OR
          -- Owner sees ALL messages
          (EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', true)::uuid AND role = 'owner'))
        )
    )
  );
