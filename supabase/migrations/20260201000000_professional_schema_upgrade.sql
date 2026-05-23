-- Professional Schema Upgrade
-- Separates platform users from shop customers, adds proper settings, guest order support

-- ============================================================================
-- 1. TENANT SETTINGS TABLE
-- Stores all configuration for each tenant/store
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Store Information
    store_name TEXT,
    store_email TEXT,
    store_phone TEXT,
    store_address JSONB DEFAULT '{}',
    logo_url TEXT,
    favicon_url TEXT,
    
    -- Business Settings
    timezone TEXT DEFAULT 'America/New_York',
    currency TEXT DEFAULT 'USD',
    tax_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Order Settings
    min_order_amount_cents INTEGER DEFAULT 0,
    delivery_fee_cents INTEGER DEFAULT 0,
    free_delivery_threshold_cents INTEGER,
    accepts_cash BOOLEAN DEFAULT true,
    accepts_card BOOLEAN DEFAULT true,
    
    -- Notification Preferences
    notify_new_order BOOLEAN DEFAULT true,
    notify_order_status BOOLEAN DEFAULT true,
    notify_low_stock BOOLEAN DEFAULT true,
    notify_new_customer BOOLEAN DEFAULT false,
    notify_email TEXT,
    notify_phone TEXT,
    
    -- Operating Hours (JSON array of {day, open, close, closed})
    operating_hours JSONB DEFAULT '[]',
    
    -- Social Links
    social_links JSONB DEFAULT '{}',
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Custom Settings (flexible key-value)
    custom_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id)
);

-- ============================================================================
-- 2. SHOP CUSTOMERS TABLE
-- Actual buyers/customers of the shop (NOT platform users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS shop_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Link to auth user (optional - for registered customers)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Customer Information
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (
        COALESCE(first_name || ' ' || last_name, first_name, last_name, email)
    ) STORED,
    phone TEXT,
    
    -- Default Addresses
    billing_address JSONB DEFAULT '{}',
    shipping_address JSONB DEFAULT '{}',
    
    -- Customer Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'vip')),
    
    -- Marketing
    accepts_marketing BOOLEAN DEFAULT false,
    marketing_opt_in_at TIMESTAMPTZ,
    
    -- Tags for segmentation
    tags TEXT[] DEFAULT '{}',
    
    -- Customer Notes (internal)
    notes TEXT,
    
    -- Statistics (denormalized for performance)
    total_orders INTEGER DEFAULT 0,
    total_spent_cents BIGINT DEFAULT 0,
    average_order_cents INTEGER DEFAULT 0,
    last_order_at TIMESTAMPTZ,
    first_order_at TIMESTAMPTZ,
    
    -- Tracking
    source TEXT, -- 'website', 'pos', 'import', 'manual'
    source_details JSONB DEFAULT '{}', -- utm params, referrer, etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique email per tenant
    UNIQUE(tenant_id, email)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_shop_customers_tenant ON shop_customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shop_customers_email ON shop_customers(email);
CREATE INDEX IF NOT EXISTS idx_shop_customers_user ON shop_customers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shop_customers_status ON shop_customers(tenant_id, status);

-- ============================================================================
-- 3. GUEST TRACKING TABLE
-- Track guest visitors and their journey before conversion
-- ============================================================================
CREATE TABLE IF NOT EXISTS guest_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Session identification
    session_token TEXT UNIQUE NOT NULL,
    
    -- Guest info (optional, captured at checkout or chat)
    email TEXT,
    name TEXT,
    phone TEXT,
    
    -- Device & Location
    ip_address INET,
    user_agent TEXT,
    device_type TEXT, -- 'mobile', 'tablet', 'desktop'
    
    -- Geolocation (from IP lookup)
    geo_country TEXT,
    geo_region TEXT,
    geo_city TEXT,
    geo_latitude DECIMAL(9,6),
    geo_longitude DECIMAL(9,6),
    
    -- Attribution
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer TEXT,
    landing_page TEXT,
    
    -- Conversion tracking
    converted_to_customer_id UUID REFERENCES shop_customers(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    
    -- Cart (for abandoned cart recovery)
    cart_items JSONB DEFAULT '[]',
    cart_total_cents INTEGER DEFAULT 0,
    cart_updated_at TIMESTAMPTZ,
    
    -- Session timeline
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    page_views INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_tenant ON guest_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_email ON guest_sessions(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guest_sessions_token ON guest_sessions(session_token);

-- ============================================================================
-- 4. ADD GUEST SUPPORT TO ORDERS
-- ============================================================================
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS shop_customer_id UUID REFERENCES shop_customers(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_guest_order BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS guest_email TEXT,
    ADD COLUMN IF NOT EXISTS guest_name TEXT,
    ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Index for customer orders
CREATE INDEX IF NOT EXISTS idx_orders_shop_customer ON orders(shop_customer_id) WHERE shop_customer_id IS NOT NULL;

-- ============================================================================
-- 5. CUSTOMER ANALYTICS VIEW
-- Combines registered customers, leads, and guest data
-- ============================================================================
CREATE OR REPLACE VIEW customer_analytics AS
SELECT 
    c.id,
    c.tenant_id,
    c.email,
    c.full_name as name,
    c.phone,
    c.status,
    c.total_orders,
    c.total_spent_cents,
    c.last_order_at,
    c.first_order_at,
    c.source,
    c.created_at,
    'customer' as customer_type,
    c.user_id IS NOT NULL as is_registered,
    c.accepts_marketing
FROM shop_customers c

UNION ALL

SELECT 
    g.id,
    g.tenant_id,
    g.email,
    g.name,
    g.phone,
    'lead' as status,
    0 as total_orders,
    g.cart_total_cents as total_spent_cents,
    NULL as last_order_at,
    NULL as first_order_at,
    g.utm_source as source,
    g.created_at,
    'lead' as customer_type,
    false as is_registered,
    false as accepts_marketing
FROM guest_sessions g
WHERE g.email IS NOT NULL 
  AND g.converted_to_customer_id IS NULL;

-- ============================================================================
-- 6. FUNCTIONS FOR CUSTOMER STATS
-- ============================================================================

-- Function to update customer stats after order
CREATE OR REPLACE FUNCTION update_customer_order_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.shop_customer_id IS NOT NULL THEN
        UPDATE shop_customers
        SET 
            total_orders = total_orders + 1,
            total_spent_cents = total_spent_cents + COALESCE(NEW.total_cents, 0),
            average_order_cents = (total_spent_cents + COALESCE(NEW.total_cents, 0)) / (total_orders + 1),
            last_order_at = NOW(),
            first_order_at = COALESCE(first_order_at, NOW()),
            updated_at = NOW()
        WHERE id = NEW.shop_customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order stats
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON orders;
CREATE TRIGGER trigger_update_customer_stats
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_order_stats();

-- Function to convert guest to customer
CREATE OR REPLACE FUNCTION convert_guest_to_customer(
    p_guest_session_id UUID,
    p_tenant_id UUID
) RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_guest guest_sessions%ROWTYPE;
BEGIN
    -- Get guest data
    SELECT * INTO v_guest FROM guest_sessions WHERE id = p_guest_session_id;
    
    IF v_guest.id IS NULL OR v_guest.email IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check if customer already exists
    SELECT id INTO v_customer_id 
    FROM shop_customers 
    WHERE tenant_id = p_tenant_id AND email = v_guest.email;
    
    IF v_customer_id IS NOT NULL THEN
        -- Update existing customer with any new info
        UPDATE shop_customers
        SET 
            phone = COALESCE(phone, v_guest.phone),
            source_details = source_details || jsonb_build_object(
                'last_utm_source', v_guest.utm_source,
                'last_referrer', v_guest.referrer
            ),
            updated_at = NOW()
        WHERE id = v_customer_id;
    ELSE
        -- Create new customer
        INSERT INTO shop_customers (
            tenant_id, email, first_name, phone, source, source_details
        ) VALUES (
            p_tenant_id,
            v_guest.email,
            v_guest.name,
            v_guest.phone,
            COALESCE(v_guest.utm_source, 'website'),
            jsonb_build_object(
                'utm_source', v_guest.utm_source,
                'utm_medium', v_guest.utm_medium,
                'utm_campaign', v_guest.utm_campaign,
                'referrer', v_guest.referrer,
                'landing_page', v_guest.landing_page,
                'ip_address', v_guest.ip_address::text,
                'geo_city', v_guest.geo_city,
                'geo_country', v_guest.geo_country
            )
        )
        RETURNING id INTO v_customer_id;
    END IF;
    
    -- Mark guest as converted
    UPDATE guest_sessions
    SET 
        converted_to_customer_id = v_customer_id,
        converted_at = NOW()
    WHERE id = p_guest_session_id;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for tenant_settings
CREATE POLICY tenant_settings_select ON tenant_settings
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM memberships WHERE user_id = auth.uid()
        )
    );

CREATE POLICY tenant_settings_insert ON tenant_settings
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY tenant_settings_update ON tenant_settings
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Policies for shop_customers
CREATE POLICY shop_customers_select ON shop_customers
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM memberships WHERE user_id = auth.uid()
        )
    );

CREATE POLICY shop_customers_all ON shop_customers
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'staff')
        )
    );

-- Policies for guest_sessions
CREATE POLICY guest_sessions_select ON guest_sessions
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM memberships WHERE user_id = auth.uid()
        )
    );

CREATE POLICY guest_sessions_insert ON guest_sessions
    FOR INSERT WITH CHECK (true); -- Allow public insert for tracking

-- ============================================================================
-- 8. INITIAL DATA MIGRATION (SKIPPED)
-- chat_conversations doesn't have tenant_id, so we skip migration
-- Data can be migrated manually per tenant if needed
-- ============================================================================

-- ============================================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tenant_settings_updated_at
    BEFORE UPDATE ON tenant_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_shop_customers_updated_at
    BEFORE UPDATE ON shop_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE!
-- ============================================================================
COMMENT ON TABLE tenant_settings IS 'Store configuration and preferences per tenant';
COMMENT ON TABLE shop_customers IS 'Actual buyers/customers of shops (not platform users)';
COMMENT ON TABLE guest_sessions IS 'Track anonymous visitors for conversion and analytics';
