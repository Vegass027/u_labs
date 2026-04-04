-- ============================================================
-- Migration 016: Fix RLS policies security vulnerability
-- Problem: Using auth.jwt() -> 'user_metadata' ->> 'role' is insecure
-- because user_metadata can be edited by users
-- Solution: Check role in public.users table using helper function
-- ============================================================

-- Create helper function to check role without recursion
CREATE OR REPLACE FUNCTION is_user_owner(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'owner' FROM public.users WHERE id = user_id;
$$;

-- Drop insecure policies that reference user_metadata
DROP POLICY IF EXISTS users_select_owner ON public.users;
DROP POLICY IF EXISTS users_select_manager ON public.users;

-- Create secure policies that check role in public.users table
-- Owner can see all users (using helper function to avoid recursion)
CREATE POLICY users_select_owner ON public.users
  FOR SELECT
  USING (is_user_owner(auth.uid()));

-- Manager can see themselves and their clients (without recursion)
CREATE POLICY users_select_manager ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR (
      EXISTS (
        SELECT 1 FROM public.orders
        WHERE manager_user_id = auth.uid()
        AND client_user_id = public.users.id
      )
    )
  );
