-- Add missing columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create function to update orders.updated_at
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update orders.updated_at
DROP TRIGGER IF EXISTS orders_update_updated_at ON public.orders;
CREATE TRIGGER orders_update_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_orders_updated_at();

-- Add missing columns to quotes table
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create function to update quotes.updated_at
CREATE OR REPLACE FUNCTION public.update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update quotes.updated_at
DROP TRIGGER IF EXISTS quotes_update_updated_at ON public.quotes;
CREATE TRIGGER quotes_update_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_quotes_updated_at();

-- Add missing columns to wishlists table
ALTER TABLE public.wishlists
ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_sign_in_ip INET,
ADD COLUMN IF NOT EXISTS security_score INT DEFAULT 50;

-- Add missing columns to user_sessions
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id_created ON public.quotes(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id_added ON public.wishlists(user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_created ON public.user_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_sign_in ON public.user_profiles(last_sign_in_at DESC);
-- Workflow fix applied
