-- Add user_id and user_role columns to separate AI chat threads by role
ALTER TABLE ai_chat_messages
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS user_role TEXT CHECK (user_role IN ('client', 'manager', 'owner'));

-- Create index for efficient filtering by order_id and user_role
CREATE INDEX IF NOT EXISTS idx_ai_chat_user_role 
  ON ai_chat_messages(order_id, user_role);
