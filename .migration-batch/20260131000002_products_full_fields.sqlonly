-- ============================================
-- Migration: Products Full Field Coverage
-- Align products schema with storefront product model
-- ============================================

-- Extend products for full catalog fidelity
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS wholesale_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS unit_type TEXT,
  ADD COLUMN IF NOT EXISTS units_per_case INTEGER,
  ADD COLUMN IF NOT EXISTS lead_time_days INTEGER,
  ADD COLUMN IF NOT EXISTS supplier_product_id TEXT,
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Constraints and basic data hygiene (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_price_cents_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_price_cents_nonnegative CHECK (price_cents IS NULL OR price_cents >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_wholesale_cents_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_wholesale_cents_nonnegative CHECK (wholesale_price_cents IS NULL OR wholesale_price_cents >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_min_order_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_min_order_nonnegative CHECK (min_order_quantity IS NULL OR min_order_quantity >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_units_per_case_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_units_per_case_nonnegative CHECK (units_per_case IS NULL OR units_per_case >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_lead_time_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_lead_time_nonnegative CHECK (lead_time_days IS NULL OR lead_time_days >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_unit_type_valid'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_unit_type_valid CHECK (
        unit_type IS NULL OR unit_type IN ('each', 'case', 'pack', 'box')
      );
  END IF;
END $$;

-- Indexes for common queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_unique
  ON public.products(sku)
  WHERE sku IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_brand
  ON public.products(brand);

CREATE INDEX IF NOT EXISTS idx_products_supplier_product_id
  ON public.products(supplier_product_id);

-- Backfill sku from internal_sku when available
UPDATE public.products
SET sku = internal_sku
WHERE sku IS NULL AND internal_sku IS NOT NULL;
