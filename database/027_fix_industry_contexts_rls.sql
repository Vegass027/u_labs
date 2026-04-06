-- ============================================================
-- Migration 027: Fix RLS policy for industry_contexts
-- Problem: RLS policy uses app.current_user_id which is not set by
--          Supabase client on frontend (only set by Fastify API middleware)
-- Solution: Use auth.uid() instead of app.current_user_id
-- Apply in: Supabase SQL Editor
-- ============================================================

-- Drop old policies
DROP POLICY IF EXISTS industry_contexts_view_active ON industry_contexts;
DROP POLICY IF EXISTS industry_contexts_owner_manage ON industry_contexts;

-- Only owner can see and manage industries (for AI context)
CREATE POLICY industry_contexts_owner_all ON industry_contexts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()
        AND role = 'owner'
    )
  );
