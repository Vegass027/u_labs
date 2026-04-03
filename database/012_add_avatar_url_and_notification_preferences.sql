-- Добавить поля для аватара и настроек уведомлений в таблицу users

ALTER TABLE users ADD COLUMN avatar_url TEXT;

ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{"new_orders": true, "status_changes": true, "new_messages": true}'::jsonb;
