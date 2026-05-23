-- ============================================
-- ADD ANASS HASSOUNI AS SUPER ADMIN
-- Email: prolivdirect@gmail.com
-- Role: rhs_admin (Super Administrator)
-- ============================================

DO $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
BEGIN
  -- Get user ID from auth.users (if they've already signed up)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'prolivdirect@gmail.com';

  -- Get the RHS admin tenant
  SELECT id INTO v_tenant_id
  FROM tenants
  WHERE slug = 'rhs-admin'
  LIMIT 1;

  -- Create tenant if it doesn't exist
  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (name, slug, status)
    VALUES ('Restaurant Hub Admin', 'rhs-admin', 'active')
    RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE 'Created rhs-admin tenant: %', v_tenant_id;
  END IF;

  -- If user doesn't exist yet, we'll create a placeholder profile
  -- The user will be fully created when they sign in via OAuth or password
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User prolivdirect@gmail.com not found in auth.users yet - will be set up on first login';
    
    -- We can't create the membership without the user_id from auth.users
    -- The API route will handle this when the user is invited via the admin panel
    RETURN;
  END IF;

  -- Check if membership already exists
  IF EXISTS (
    SELECT 1 FROM memberships 
    WHERE user_id = v_user_id AND tenant_id = v_tenant_id
  ) THEN
    -- Update existing membership to super admin
    UPDATE memberships 
    SET role = 'rhs_admin', status = 'active'
    WHERE user_id = v_user_id AND tenant_id = v_tenant_id;
    
    RAISE NOTICE 'Updated existing membership to rhs_admin for user: %', v_user_id;
  ELSE
    -- Create new membership
    INSERT INTO memberships (user_id, tenant_id, role, status)
    VALUES (v_user_id, v_tenant_id, 'rhs_admin', 'active');
    
    RAISE NOTICE 'Created rhs_admin membership for user: %', v_user_id;
  END IF;

  -- Update or create user profile
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (v_user_id, 'prolivdirect@gmail.com', 'Anass Hassouni', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET 
    full_name = 'Anass Hassouni',
    role = 'super_admin';

  RAISE NOTICE 'Successfully made prolivdirect@gmail.com (Anass Hassouni) an RHS Super Admin!';
END $$;

-- ============================================
-- ADMIN INVITES TRACKING TABLE (Optional)
-- Track pending admin invitations
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  temporary_password_hash TEXT, -- Store hashed temp password if used
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(email, status) -- One pending invite per email
);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON public.admin_invites(email);
CREATE INDEX IF NOT EXISTS idx_admin_invites_status ON public.admin_invites(status);
CREATE INDEX IF NOT EXISTS idx_admin_invites_expires ON public.admin_invites(expires_at) 
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Only super admins can view invites
DROP POLICY IF EXISTS "Super admins can view invites" ON public.admin_invites;
CREATE POLICY "Super admins can view invites" ON public.admin_invites
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = (SELECT auth.uid())
        AND memberships.role = 'rhs_admin'
        AND memberships.status = 'active'
    )
  );

-- Service role can manage invites
DROP POLICY IF EXISTS "Service can manage invites" ON public.admin_invites;
CREATE POLICY "Service can manage invites" ON public.admin_invites
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNCTION: Process accepted invite
-- Called when a new user signs up and has a pending invite
-- ============================================

CREATE OR REPLACE FUNCTION public.process_admin_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite RECORD;
  v_tenant_id uuid;
BEGIN
  -- Check if there's a pending invite for this email
  SELECT * INTO v_invite
  FROM public.admin_invites
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  LIMIT 1;

  IF v_invite IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get the RHS admin tenant
  SELECT id INTO v_tenant_id
  FROM tenants
  WHERE slug = 'rhs-admin'
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'rhs-admin tenant not found';
    RETURN NEW;
  END IF;

  -- Create membership
  INSERT INTO public.memberships (user_id, tenant_id, role, status)
  VALUES (NEW.id, v_tenant_id, v_invite.role, 'active')
  ON CONFLICT (user_id, tenant_id) DO UPDATE SET
    role = EXCLUDED.role,
    status = 'active';

  -- Update user profile
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    v_invite.full_name,
    CASE WHEN v_invite.role = 'rhs_admin' THEN 'super_admin' ELSE v_invite.role END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    role = CASE WHEN v_invite.role = 'rhs_admin' THEN 'super_admin' ELSE v_invite.role END;

  -- Mark invite as accepted
  UPDATE public.admin_invites
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = v_invite.id;

  RAISE NOTICE 'Processed admin invite for % as %', NEW.email, v_invite.role;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_admin_invite_signup ON auth.users;
CREATE TRIGGER on_admin_invite_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_admin_invite();
