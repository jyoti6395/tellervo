-- ====================================================================
-- Tellervo: Admin View Profiles RLS Policy Migration
-- Migration: 20261028000000_admin_view_profiles_policy.sql
-- ====================================================================

-- 1. Helper function to check if the current user is an administrator
-- Uses SECURITY DEFINER to bypass RLS recursion when reading public.profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR tier = 'Founder Patron')
  ) OR (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  ) OR (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );
$$;

-- 2. Create the SELECT policy on public.profiles allowing administrators to view all customer profiles
-- Drop if exists to ensure idempotent execution
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

