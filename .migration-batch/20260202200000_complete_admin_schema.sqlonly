-- =====================================================
-- COMPLETE ADMIN DASHBOARD SCHEMA
-- Missing tables for production-ready admin features
-- =====================================================

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    warehouse_location TEXT,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0, -- Orders pending fulfillment
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    unit_cost DECIMAL(10, 2),
    last_counted_at TIMESTAMP WITH TIME ZONE,
    last_received_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, warehouse_location)
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer', 'count')),
    quantity INTEGER NOT NULL, -- Positive for increases, negative for decreases
    reference_type TEXT, -- 'order', 'quote', 'purchase_order', etc.
    reference_id UUID,
    unit_cost DECIMAL(10, 2),
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT CATEGORIES (Enhanced)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category reference to products if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL;
        
        CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
    END IF;
END $$;

-- =====================================================
-- MARKETING & EMAIL CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview_text TEXT,
    from_name TEXT NOT NULL DEFAULT 'Restaurant Hub',
    from_email TEXT NOT NULL,
    reply_to TEXT,
    template_id TEXT, -- Resend template ID
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    content_html TEXT,
    content_json JSONB, -- Structured content for email builder
    tags TEXT[],
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('welcome', 'abandoned_cart', 'post_purchase', 're_engagement', 'birthday', 'custom')),
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    subject TEXT NOT NULL,
    from_name TEXT NOT NULL DEFAULT 'Restaurant Hub',
    from_email TEXT NOT NULL,
    template_id TEXT,
    content_html TEXT,
    content_json JSONB,
    delay_minutes INTEGER DEFAULT 0, -- Delay after trigger
    is_active BOOLEAN DEFAULT true,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    phone TEXT,
    status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained')),
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}'::jsonb,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    last_email_opened_at TIMESTAMP WITH TIME ZONE,
    last_email_clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTIONS (Stripe Integration)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    stripe_price_id TEXT UNIQUE,
    stripe_product_id TEXT,
    billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    trial_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRICING RULES & MARGINS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('markup', 'margin', 'fixed', 'formula')),
    applies_to TEXT NOT NULL CHECK (applies_to IN ('all', 'category', 'product', 'customer')),
    target_id UUID, -- category_id, product_id, or customer_id
    value DECIMAL(10, 2) NOT NULL,
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.price_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    old_price DECIMAL(10, 2) NOT NULL,
    new_price DECIMAL(10, 2) NOT NULL,
    old_cost DECIMAL(10, 2),
    new_cost DECIMAL(10, 2),
    reason TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inventory_items_product ON public.inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON public.inventory_items(status) WHERE status != 'discontinued';
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory ON public.stock_movements(inventory_item_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON public.stock_movements(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_automations_active ON public.email_automations(is_active, trigger_type);
CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON public.email_contacts(status, email);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_customer ON public.customer_subscriptions(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_stripe ON public.customer_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON public.pricing_rules(is_active, applies_to, priority);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON public.price_change_history(product_id, changed_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS product_categories_updated_at ON public.product_categories;
CREATE TRIGGER product_categories_updated_at BEFORE UPDATE ON public.product_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS email_automations_updated_at ON public.email_automations;
CREATE TRIGGER email_automations_updated_at BEFORE UPDATE ON public.email_automations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS email_contacts_updated_at ON public.email_contacts;
CREATE TRIGGER email_contacts_updated_at BEFORE UPDATE ON public.email_contacts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS customer_subscriptions_updated_at ON public.customer_subscriptions;
CREATE TRIGGER customer_subscriptions_updated_at BEFORE UPDATE ON public.customer_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS pricing_rules_updated_at ON public.pricing_rules;
CREATE TRIGGER pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_change_history ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies (using existing is_rhs_admin or is_member_of_tenant functions)

-- Inventory
DROP POLICY IF EXISTS "inventory_admin_all" ON public.inventory_items;
CREATE POLICY "inventory_admin_all" ON public.inventory_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

DROP POLICY IF EXISTS "stock_movements_admin_all" ON public.stock_movements;
CREATE POLICY "stock_movements_admin_all" ON public.stock_movements
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

-- Categories (public read, admin write)
DROP POLICY IF EXISTS "categories_public_read" ON public.product_categories;
CREATE POLICY "categories_public_read" ON public.product_categories
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "categories_admin_all" ON public.product_categories;
CREATE POLICY "categories_admin_all" ON public.product_categories
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin')
        AND m.status = 'active'
    )
);

-- Email campaigns (admin only)
DROP POLICY IF EXISTS "campaigns_admin_all" ON public.email_campaigns;
CREATE POLICY "campaigns_admin_all" ON public.email_campaigns
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin')
        AND m.status = 'active'
    )
);

DROP POLICY IF EXISTS "automations_admin_all" ON public.email_automations;
CREATE POLICY "automations_admin_all" ON public.email_automations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin')
        AND m.status = 'active'
    )
);

DROP POLICY IF EXISTS "contacts_admin_all" ON public.email_contacts;
CREATE POLICY "contacts_admin_all" ON public.email_contacts
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin')
        AND m.status = 'active'
    )
);

-- Subscriptions (customers can read their own, admins can manage all)
DROP POLICY IF EXISTS "plans_public_read" ON public.subscription_plans;
CREATE POLICY "plans_public_read" ON public.subscription_plans
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "plans_admin_all" ON public.subscription_plans;
CREATE POLICY "plans_admin_all" ON public.subscription_plans
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin')
        AND m.status = 'active'
    )
);

DROP POLICY IF EXISTS "customer_subs_own_read" ON public.customer_subscriptions;
CREATE POLICY "customer_subs_own_read" ON public.customer_subscriptions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.tenant_id = customer_id
        AND m.status = 'active'
    )
);

DROP POLICY IF EXISTS "customer_subs_admin_all" ON public.customer_subscriptions;
CREATE POLICY "customer_subs_admin_all" ON public.customer_subscriptions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin')
        AND m.status = 'active'
    )
);

-- Pricing (admin only)
DROP POLICY IF EXISTS "pricing_rules_admin_all" ON public.pricing_rules;
CREATE POLICY "pricing_rules_admin_all" ON public.pricing_rules
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

DROP POLICY IF EXISTS "price_history_admin_all" ON public.price_change_history;
CREATE POLICY "price_history_admin_all" ON public.price_change_history
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

-- =====================================================
-- SEED DATA (Optional - Basic Categories)
-- =====================================================

INSERT INTO public.product_categories (name, slug, description, display_order) VALUES
    ('Packaging', 'packaging', 'Food containers, boxes, and packaging materials', 1),
    ('Paper Products', 'paper-products', 'Napkins, towels, and paper supplies', 2),
    ('Cutlery', 'cutlery', 'Forks, knives, spoons, and utensils', 3),
    ('Smallwares', 'smallwares', 'Kitchen tools and small equipment', 4),
    ('Labels & Stickers', 'labels-stickers', 'Product labels and branding materials', 5)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.inventory_items IS 'Tracks inventory levels for products across warehouse locations';
COMMENT ON TABLE public.stock_movements IS 'Audit trail of all inventory changes';
COMMENT ON TABLE public.product_categories IS 'Hierarchical product categorization system';
COMMENT ON TABLE public.email_campaigns IS 'One-time email marketing campaigns';
COMMENT ON TABLE public.email_automations IS 'Trigger-based automated email sequences';
COMMENT ON TABLE public.subscription_plans IS 'Recurring billing plans (Stripe integration)';
COMMENT ON TABLE public.customer_subscriptions IS 'Active customer subscriptions linked to Stripe';
COMMENT ON TABLE public.pricing_rules IS 'Dynamic pricing rules with priority-based application';
COMMENT ON TABLE public.price_change_history IS 'Audit log of all price modifications';
