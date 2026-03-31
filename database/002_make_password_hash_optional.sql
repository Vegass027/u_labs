-- Make password_hash optional in users table
-- Supabase Auth already stores the password hash, so we don't need to duplicate it

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
