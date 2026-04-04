-- ============================================================
-- Migration 017: Fix RLS security vulnerability - FINAL SOLUTION
-- 
-- PROBLEM ANALYSIS:
-- 1. Original policies used auth.jwt() -> 'user_metadata' ->> 'role'
--    - This is INSECURE because user_metadata can be edited by users
-- 2. Attempted fix used public.users table with RLS
--    - This created RECURSION because function is_user_owner() 
--      queries public.users which has RLS policies
-- 3. SECURITY DEFINER functions CANNOT bypass RLS on regular tables
--    - They only bypass RLS on views
--
-- CORRECT SOLUTION (per Supabase docs):
-- 1. Store role in auth.users.raw_app_meta_data (cannot be edited by users)
-- 2. Create SECURITY DEFINER function that queries auth.users (no RLS)
-- 3. Use this function in RLS policies
-- ============================================================

-- Step 1: Update auth.users.raw_app_meta_data with roles from public.users
-- This is a one-time migration to sync the data
UPDATE auth.users
SET raw_app_meta_data = COALESCE(
  raw_app_meta_data || jsonb_build_object('role', pu.role),
  raw_app_meta_data
)
FROM public.users pu
WHERE auth.users.id = pu.id
AND pu.role IS NOT NULL;

-- Step 2: Create helper function that queries auth.users (no RLS)
-- This function is safe because:
-- - auth.users has NO RLS policies
-- - raw_app_meta_data cannot be edited by users
-- - SECURITY DEFINER ensures it runs with elevated privileges
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

-- Step 3: Create helper function to check if user is manager
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

-- Step 4: Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_manager(uuid) TO authenticated;

-- Step 5: Drop old insecure policies
DROP POLICY IF EXISTS users_select_owner ON public.users;
DROP POLICY IF EXISTS users_select_manager ON public.users;

-- Step 6: Create secure policies using helper functions
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
    auth.uid() = id
    OR (
      (SELECT public.is_user_manager(auth.uid()))
      AND EXISTS (
        SELECT 1 FROM public.orders
        WHERE manager_user_id = auth.uid()
        AND client_user_id = public.users.id
      )
    )
  );

-- Step 7: Update trigger to sync role to auth.users on insert/update
CREATE OR REPLACE FUNCTION public.sync_role_to_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update auth.users.raw_app_meta_data with the role
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(
    raw_app_meta_data || jsonb_build_object('role', NEW.role),
    raw_app_meta_data
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Step 8: Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS sync_role_to_auth_trigger ON public.users;
CREATE TRIGGER sync_role_to_auth_trigger
  AFTER INSERT OR UPDATE OF role
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_role_to_auth();
