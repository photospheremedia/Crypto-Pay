-- Fix convert_guest_to_customer function - full_name is a generated column
DROP FUNCTION IF EXISTS public.convert_guest_to_customer(UUID, UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.convert_guest_to_customer(
    p_guest_session_id UUID,
    p_tenant_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_customer_id UUID;
    v_guest_email TEXT;
    v_guest_name TEXT;
    v_guest_phone TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Get guest session info
    SELECT email, name, phone
    INTO v_guest_email, v_guest_name, v_guest_phone
    FROM public.guest_sessions
    WHERE id = p_guest_session_id
      AND tenant_id = p_tenant_id;
    
    IF v_guest_email IS NULL THEN
        RAISE EXCEPTION 'Guest session not found or has no email';
    END IF;
    
    -- Parse name into first/last (simple split on space)
    IF v_guest_name IS NOT NULL THEN
        v_first_name := split_part(v_guest_name, ' ', 1);
        v_last_name := NULLIF(trim(substring(v_guest_name from position(' ' in v_guest_name) + 1)), '');
    END IF;
    
    -- Check if customer already exists for this email
    SELECT id INTO v_customer_id
    FROM public.shop_customers
    WHERE email = v_guest_email
      AND tenant_id = p_tenant_id;
    
    -- Create new customer if doesn't exist
    IF v_customer_id IS NULL THEN
        INSERT INTO public.shop_customers (
            tenant_id,
            email,
            first_name,
            last_name,
            phone,
            source,
            source_details,
            created_at
        ) VALUES (
            p_tenant_id,
            v_guest_email,
            v_first_name,
            v_last_name,
            v_guest_phone,
            'guest_conversion',
            jsonb_build_object('guest_session_id', p_guest_session_id),
            NOW()
        )
        RETURNING id INTO v_customer_id;
    END IF;
    
    -- Mark guest session as converted
    UPDATE public.guest_sessions
    SET 
        converted_to_customer_id = v_customer_id,
        converted_at = NOW()
    WHERE id = p_guest_session_id;
    
    -- Note: Cart/order transfer logic depends on your specific schema
    -- The carts table uses session_id, not guest_id
    -- If you need to link carts to customers, you may need to:
    -- 1. Add a customer_id column to carts table, OR
    -- 2. Link via session_token in guest_sessions
    
    RETURN v_customer_id;
END;
$$;

COMMENT ON FUNCTION public.convert_guest_to_customer(UUID, UUID)
IS 'Converts a guest session to a registered customer account and transfers their data. Note: full_name is auto-generated from first_name + last_name';

GRANT EXECUTE ON FUNCTION public.convert_guest_to_customer(UUID, UUID) TO authenticated, service_role;
