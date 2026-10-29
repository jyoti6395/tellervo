-- ====================================================================
-- Tellervo: Extend Products Schema
-- Migration: 20261029000000_extend_products_schema.sql
-- Adds:
--  - original_price (NUMERIC(10,2))
--  - discount_price (NUMERIC(10,2) NULL)
--  - images (TEXT[] DEFAULT '{}')
--  - badge (TEXT NULL)
--  - badge_type (TEXT NULL)
--  - is_featured (BOOLEAN DEFAULT false)
--  - is_most_selling (BOOLEAN DEFAULT false)
--  - flavor_profile (JSONB NULL)
-- ====================================================================

-- 1. Prices: Add original_price and discount_price
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10,2) DEFAULT NULL;

-- Migrate existing price to original_price if present
UPDATE public.products
SET original_price = price
WHERE original_price IS NULL AND price IS NOT NULL;

-- If original_price is still null, default to 0.00
UPDATE public.products
SET original_price = 0.00
WHERE original_price IS NULL;

-- Set default for new rows
ALTER TABLE public.products ALTER COLUMN original_price SET DEFAULT 0.00;

-- 2. Images: Add images array column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migrate existing single image_url into images array
UPDATE public.products
SET images = ARRAY[image_url]
WHERE (images IS NULL OR images = '{}') AND image_url IS NOT NULL AND image_url != '';

-- 3. Badges: Add badge and badge_type
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge_type TEXT DEFAULT NULL;

-- 4. Featured: Add is_featured
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- 5. Most Selling: Add is_most_selling
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_most_selling BOOLEAN NOT NULL DEFAULT false;

-- 6. Flavor Profile: Add flavor_profile JSONB
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS flavor_profile JSONB DEFAULT NULL;

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_most_selling ON public.products (is_most_selling);
CREATE INDEX IF NOT EXISTS idx_products_badge_type ON public.products (badge_type);
CREATE INDEX IF NOT EXISTS idx_products_original_price ON public.products (original_price);
CREATE INDEX IF NOT EXISTS idx_products_discount_price ON public.products (discount_price);
