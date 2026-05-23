-- Add gwaelg@gmail.com as admin
-- First, find the user by email and add them to memberships with admin role

DO $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'gwaelg@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User gwaelg@gmail.com not found in auth.users';
    RETURN;
  END IF;

  -- Get or create a default tenant for RHS admins
  SELECT id INTO v_tenant_id
  FROM tenants
  WHERE slug = 'rhs-admin'
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    -- Create the RHS admin tenant if it doesn't exist
    INSERT INTO tenants (name, slug, status)
    VALUES ('Restaurant Hub Admin', 'rhs-admin', 'active')
    RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE 'Created rhs-admin tenant: %', v_tenant_id;
  END IF;

  -- Check if membership already exists
  IF EXISTS (
    SELECT 1 FROM memberships 
    WHERE user_id = v_user_id AND tenant_id = v_tenant_id
  ) THEN
    -- Update existing membership to admin
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

  RAISE NOTICE 'Successfully made gwaelg@gmail.com an RHS admin!';
END $$;

-- Also ensure user profile exists with admin info
INSERT INTO user_profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
  'super_admin'
FROM auth.users
WHERE email = 'gwaelg@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
