-- SMS notification preferences, phone verification challenges, and outbound audit log.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS sms_phone_e164 text,
  ADD COLUMN IF NOT EXISTS sms_opt_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS sms_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS sms_disabled_at timestamptz;

COMMENT ON COLUMN public.user_settings.sms_phone_e164 IS 'E.164 phone for transactional SMS (notifications only, not auth MFA).';
COMMENT ON COLUMN public.user_settings.sms_opt_in_at IS 'When the merchant explicitly opted in to SMS notifications.';
COMMENT ON COLUMN public.user_settings.sms_verified_at IS 'When sms_phone_e164 was verified via OTP challenge.';
COMMENT ON COLUMN public.user_settings.sms_disabled_at IS 'When the merchant turned off SMS without revoking opt-in.';

CREATE TABLE IF NOT EXISTS public.sms_phone_verification_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  phone_e164 text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_phone_challenges_user_created
  ON public.sms_phone_verification_challenges (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.sms_outbound_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  to_phone_e164 text NOT NULL,
  event text NOT NULL,
  body_preview text NOT NULL,
  idempotency_key text,
  provider text,
  provider_message_id text,
  status text NOT NULL DEFAULT 'pending',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_outbound_log_status_check
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_outbound_log_idempotency
  ON public.sms_outbound_log (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sms_outbound_log_user_created
  ON public.sms_outbound_log (user_id, created_at DESC);

ALTER TABLE public.sms_phone_verification_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_outbound_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own SMS challenges" ON public.sms_phone_verification_challenges;
CREATE POLICY "Users read own SMS challenges"
  ON public.sms_phone_verification_challenges
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users read own SMS outbound log" ON public.sms_outbound_log;
CREATE POLICY "Users read own SMS outbound log"
  ON public.sms_outbound_log
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "CP admins read SMS outbound log" ON public.sms_outbound_log;
CREATE POLICY "CP admins read SMS outbound log"
  ON public.sms_outbound_log
  FOR SELECT
  USING (public.is_platform_super_admin());

-- Inserts/updates for challenges and outbound log use service role from portal API only.
