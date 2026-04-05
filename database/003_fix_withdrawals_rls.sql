-- ============================================================
-- Agency Platform — Fix Withdrawals RLS Policy
-- PostgreSQL 15+
-- ============================================================
-- Description: Fix RLS policy for withdrawals to check role from auth.users
-- instead of public.users (rule #155: role must be read from auth.users.raw_user_meta_data)
-- ============================================================

-- Drop the incorrect policy
DROP POLICY IF EXISTS withdrawals_owner_all ON withdrawal_requests;

-- Create the correct policy that checks role from auth.users.raw_user_meta_data
CREATE POLICY withdrawals_owner_all ON withdrawal_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = current_setting('app.current_user_id', true)::uuid
      AND raw_user_meta_data->>'role' = 'owner'
    )
  );
