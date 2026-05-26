-- Update auth configuration for custom domain
-- Note: This needs to be done via Supabase Dashboard
-- Go to: https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/auth/url-configuration

-- Add these redirect URLs:
-- https://cryptopay.sale/auth/callback
-- https://www.cryptopay.sale/auth/callback
-- https://<project-ref>.supabase.co/auth/callback (keep existing)

-- Set Site URL to:
-- https://cryptopay.sale

-- Additional redirect URLs to add:
-- http://localhost:3000/auth/callback (for local development)
