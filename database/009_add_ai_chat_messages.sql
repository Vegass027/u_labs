-- ============================================================
-- AI Chat Messages — история чата с ИИ-брифером
-- ============================================================

CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_order ON ai_chat_messages(order_id, created_at ASC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Только участники заказа могут видеть сообщения AI-чата
CREATE POLICY ai_chat_participants ON ai_chat_messages
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id
      AND (
        o.manager_user_id = current_setting('app.current_user_id')::uuid OR
        EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'owner')
      )
  )
);

-- Только участники заказа могут создавать сообщения в AI-чате
CREATE POLICY ai_chat_insert_participants ON ai_chat_messages
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id
      AND (
        o.manager_user_id = current_setting('app.current_user_id')::uuid OR
        EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'owner')
      )
  )
);
