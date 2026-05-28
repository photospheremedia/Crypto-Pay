-- Add missing indexes for foreign keys flagged by Supabase performance advisors.
--
-- Note: We intentionally avoid CREATE INDEX CONCURRENTLY because Supabase migrations
-- run in a transaction. These tables are expected to be small; if they grow large,
-- switch to a manual concurrent index build during a maintenance window.

CREATE INDEX IF NOT EXISTS idx_email_automations_created_by
ON public.email_automations (created_by);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by
ON public.email_campaigns (created_by);

CREATE INDEX IF NOT EXISTS idx_merchant_wallets_verified_by
ON public.merchant_wallets (verified_by);

CREATE INDEX IF NOT EXISTS idx_runner_api_events_merchant_wallet_id
ON public.runner_api_events (merchant_wallet_id);

CREATE INDEX IF NOT EXISTS idx_runner_api_events_user_id
ON public.runner_api_events (user_id);

