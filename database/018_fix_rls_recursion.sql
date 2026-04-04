-- ============================================================
-- Migration 018: Fix RLS recursion on public.users
-- 
-- PROBLEM: Current policies in DB don't match migration 017
-- - users_select_manager causes infinite recursion
-- - users_select_owner doesn't use helper functions
--
-- SOLUTION: Recreate policies using SECURITY DEFINER functions
-- ============================================================

-- Step 1: Drop problematic policies
DROP POLICY IF EXISTS users_select_owner ON public.users;
DROP POLICY IF EXISTS users_select_manager ON public.users;

-- Step 2: Ensure helper functions exist (recreate if needed)
CREATE OR REPLACE FUNCTION public.is_user_owner(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT raw_app_meta_data ->> 'role' = 'owner'
  FROM auth.users
  WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_user_manager(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT raw_app_meta_data ->> 'role' = 'manager'
  FROM auth.users
  WHERE id = user_id;
$$;

-- Step 3: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_manager(uuid) TO authenticated;

-- Step 4: Create secure policies using helper functions
-- Owner can see all users
CREATE POLICY users_select_owner ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_user_owner(auth.uid())));

-- Manager can see themselves and their clients
CREATE POLICY users_select_manager ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR (
      (SELECT public.is_user_manager(auth.uid()))
      AND EXISTS (
        SELECT 1 FROM public.orders
        WHERE manager_user_id = (SELECT auth.uid())
        AND client_user_id = public.users.id
      )
    )
  );

-- Step 5: Update auth.users.raw_app_meta_data with roles from public.users
-- This ensures role is synced for existing users
UPDATE auth.users u
SET raw_app_meta_data = COALESCE(
  u.raw_app_meta_data || jsonb_build_object('role', pu.role::text),
  u.raw_app_meta_data
)
FROM public.users pu
WHERE u.id = pu.id
AND pu.role IS NOT NULL
AND (u.raw_app_meta_data ->> 'role' IS NULL OR u.raw_app_meta_data ->> 'role' != pu.role::text);
