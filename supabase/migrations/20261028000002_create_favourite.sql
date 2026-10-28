-- ====================================================================
-- Tellervo: Dedicated User Favorites Table
-- Migration: 20261028000002_create_favourite.sql
-- ====================================================================

-- 1. Create the favourite table
CREATE TABLE IF NOT EXISTS public.favourite (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  order_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Index for instant user query lookup
CREATE INDEX IF NOT EXISTS idx_favourite_user_id ON public.favourite(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.favourite ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Each user can only view, insert, update and delete their own favorites
DROP POLICY IF EXISTS "Users can view own favourite record" ON public.favourite;
CREATE POLICY "Users can view own favourite record"
  ON public.favourite
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favourite record" ON public.favourite;
CREATE POLICY "Users can insert own favourite record"
  ON public.favourite
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own favourite record" ON public.favourite;
CREATE POLICY "Users can update own favourite record"
  ON public.favourite
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favourite record" ON public.favourite;
CREATE POLICY "Users can delete own favourite record"
  ON public.favourite
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins policy for management
DROP POLICY IF EXISTS "Admins full access to favourite" ON public.favourite;
CREATE POLICY "Admins full access to favourite"
  ON public.favourite
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

