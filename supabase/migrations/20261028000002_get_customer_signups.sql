-- ====================================================================
-- Tellervo: Secure Function to Fetch Customer Sign-Up Data
-- Migration: 20261028000002_get_customer_signups.sql
-- ====================================================================

-- Create secure RPC function to fetch customer sign-ups from auth.users
-- Accessible strictly to logged-in Admins
CREATE OR REPLACE FUNCTION public.get_customer_signups()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  joined_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- 1. Security check: Only allow users with admin role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can view customer sign-up data.';
  END IF;

  -- 2. Query auth.users and public.profiles, excluding all admin accounts
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      p.full_name,
      'No Name'
    )::TEXT AS name,
    COALESCE(u.email::TEXT, ''::TEXT) AS email,
    COALESCE(
      u.phone::TEXT,
      u.raw_user_meta_data->>'phone',
      p.phone,
      'No Phone'
    )::TEXT AS phone,
    u.created_at AS joined_date
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE 
    -- Exclude Admins: Only customers
    (p.role IS NULL OR p.role = 'customer')
    AND COALESCE(u.raw_app_meta_data->>'role', '') != 'admin'
    AND COALESCE(u.raw_user_meta_data->>'role', '') != 'admin'
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execution to authenticated users (admin check is enforced inside function)
GRANT EXECUTE ON FUNCTION public.get_customer_signups() TO authenticated;
