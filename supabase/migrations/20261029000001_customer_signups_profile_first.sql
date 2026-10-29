-- ====================================================================
-- Tellervo Migration: Customer Signups Profile-First Source of Truth
-- Migration: 20261029000001_customer_signups_profile_first.sql
-- Description:
--   - NAME: Comes from public.profiles.full_name (fallback to signup metadata)
--   - PHONE: Comes from public.profiles.phone (fallback to signup metadata)
--   - STATUS: Comes from public.profiles.status
--   - EMAIL: Comes from auth.users.email (signup only)
--   - JOINED_DATE: Comes from auth.users.created_at (signup only)
-- ====================================================================

DROP FUNCTION IF EXISTS public.get_customer_signups();

CREATE OR REPLACE FUNCTION public.get_customer_signups()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT,
  joined_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Security check: Only allow users with admin role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can view customer sign-up data.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    -- 1. NAME: Comes from public.profiles first
    COALESCE(
      NULLIF(TRIM(p.full_name), ''),
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      'No Name'
    )::TEXT AS name,
    -- 2. EMAIL: Comes strictly from signup (auth.users)
    COALESCE(u.email::TEXT, ''::TEXT) AS email,
    -- 3. PHONE: Comes from public.profiles first
    COALESCE(
      NULLIF(TRIM(p.phone), ''),
      u.phone::TEXT,
      u.raw_user_meta_data->>'phone',
      'No Phone'
    )::TEXT AS phone,
    -- 4. STATUS: Comes from public.profiles
    COALESCE(p.status, 'active')::TEXT AS status,
    -- 5. JOINED_DATE: Comes strictly from signup (auth.users)
    u.created_at AS joined_date
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE 
    (p.role IS NULL OR p.role = 'customer')
    AND COALESCE(u.raw_app_meta_data->>'role', '') != 'admin'
    AND COALESCE(u.raw_user_meta_data->>'role', '') != 'admin'
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_signups() TO authenticated;

