-- Customer Pricing Tiers
-- This schema supports B2B customer-specific pricing for restaurant supply

-- Price tiers define different pricing levels
CREATE TABLE IF NOT EXISTS price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'custom')),
    discount_value DECIMAL(10, 2), -- percentage or fixed amount
    priority INTEGER DEFAULT 0, -- higher priority = applied first
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer tier assignments
CREATE TABLE IF NOT EXISTS customer_price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES price_tiers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- NULL means no expiration
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(customer_id, tier_id, start_date)
);

-- Custom product prices for specific customers (contract pricing)
CREATE TABLE IF NOT EXISTS customer_product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL, -- References your products table
    custom_price DECIMAL(10, 2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- NULL means no expiration
    contract_reference TEXT, -- External contract ID
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(customer_id, product_id, min_quantity, start_date)
);

-- Category-level discounts for customers
CREATE TABLE IF NOT EXISTS customer_category_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL, -- References your categories table
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(customer_id, category_id, start_date)
);

-- Volume-based pricing (quantity breaks)
CREATE TABLE IF NOT EXISTS volume_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL, -- References your products table
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER, -- NULL means no upper limit
    unit_price DECIMAL(10, 2) NOT NULL,
    tier_id UUID REFERENCES price_tiers(id), -- Optional: specific to a tier
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment terms for B2B customers
CREATE TABLE IF NOT EXISTS customer_payment_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    payment_terms_days INTEGER DEFAULT 0, -- 0 = immediate, 30 = Net 30, etc.
    early_payment_discount DECIMAL(5, 2), -- e.g., 2% for 2/10 Net 30
    early_payment_days INTEGER, -- e.g., 10 for 2/10 Net 30
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_price_tiers_customer ON customer_price_tiers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_price_tiers_active ON customer_price_tiers(tier_id, end_date);
CREATE INDEX IF NOT EXISTS idx_customer_product_prices_customer ON customer_product_prices(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_product_prices_product ON customer_product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_volume_pricing_product ON volume_pricing(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_payment_terms_customer ON customer_payment_terms(customer_id);

-- Function to get the effective price for a customer and product
CREATE OR REPLACE FUNCTION get_customer_price(
    p_customer_id UUID,
    p_product_id UUID,
    p_quantity INTEGER DEFAULT 1,
    p_base_price DECIMAL DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
    v_price DECIMAL;
    v_custom_price DECIMAL;
    v_tier_discount DECIMAL;
    v_volume_price DECIMAL;
    v_category_discount DECIMAL;
BEGIN
    -- Start with base price
    v_price := p_base_price;
    
    -- 1. Check for custom product price (highest priority)
    SELECT custom_price INTO v_custom_price
    FROM customer_product_prices
    WHERE customer_id = p_customer_id
      AND product_id = p_product_id
      AND min_quantity <= p_quantity
      AND is_active = true
      AND start_date <= CURRENT_DATE
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    ORDER BY min_quantity DESC
    LIMIT 1;
    
    IF v_custom_price IS NOT NULL THEN
        RETURN v_custom_price;
    END IF;
    
    -- 2. Check for volume pricing
    SELECT unit_price INTO v_volume_price
    FROM volume_pricing
    WHERE product_id = p_product_id
      AND min_quantity <= p_quantity
      AND (max_quantity IS NULL OR max_quantity >= p_quantity)
      AND is_active = true
    ORDER BY min_quantity DESC
    LIMIT 1;
    
    IF v_volume_price IS NOT NULL THEN
        v_price := v_volume_price;
    END IF;
    
    -- 3. Apply tier discount if customer has one
    SELECT 
        CASE 
            WHEN pt.discount_type = 'percentage' THEN v_price * (1 - pt.discount_value / 100)
            WHEN pt.discount_type = 'fixed' THEN v_price - pt.discount_value
            ELSE v_price
        END INTO v_tier_discount
    FROM customer_price_tiers cpt
    JOIN price_tiers pt ON pt.id = cpt.tier_id
    WHERE cpt.customer_id = p_customer_id
      AND pt.is_active = true
      AND cpt.start_date <= CURRENT_DATE
      AND (cpt.end_date IS NULL OR cpt.end_date >= CURRENT_DATE)
    ORDER BY pt.priority DESC
    LIMIT 1;
    
    IF v_tier_discount IS NOT NULL THEN
        v_price := v_tier_discount;
    END IF;
    
    RETURN GREATEST(v_price, 0); -- Never return negative price
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_category_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payment_terms ENABLE ROW LEVEL SECURITY;

-- Admins can manage all pricing
CREATE POLICY "Admins can manage price_tiers" ON price_tiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('rhs_admin', 'admin', 'owner')
        )
    );

CREATE POLICY "Admins can manage customer_price_tiers" ON customer_price_tiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('rhs_admin', 'admin', 'owner')
        )
    );

-- Customers can view their own pricing
CREATE POLICY "Customers can view own price tiers" ON customer_price_tiers
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can view own product prices" ON customer_product_prices
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can view own payment terms" ON customer_payment_terms
    FOR SELECT USING (customer_id = auth.uid());

-- Insert default price tiers
INSERT INTO price_tiers (name, description, discount_type, discount_value, priority) VALUES
    ('Standard', 'Default pricing for all customers', 'percentage', 0, 0),
    ('Bronze', '5% discount for small businesses', 'percentage', 5, 10),
    ('Silver', '10% discount for regular customers', 'percentage', 10, 20),
    ('Gold', '15% discount for high-volume customers', 'percentage', 15, 30),
    ('Platinum', '20% discount for enterprise accounts', 'percentage', 20, 40),
    ('Contract', 'Custom contract pricing', 'custom', NULL, 100)
ON CONFLICT DO NOTHING;
