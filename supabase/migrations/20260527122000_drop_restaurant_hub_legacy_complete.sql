-- Drop all legacy Restaurant Hub schema (shop, billing, inventory, pricing, guest shop).
-- Crypto Pay keeps: tenants, memberships, user_profiles/settings, wallets, chat, leads,
-- newsletter, audit, admin_invites, email_campaigns/automations, tenant_settings, security tables.

begin;

-- ---------------------------------------------------------------------------
-- Views (depend on RH tables)
-- ---------------------------------------------------------------------------
drop view if exists public.customer_analytics;

-- Triggers are dropped with their tables in 20260527120500 / 20260527121000.

-- ---------------------------------------------------------------------------
-- Tables (children before parents) — idempotent IF NOT EXISTS drops
-- ---------------------------------------------------------------------------

-- Shop / orders / promotions
drop table if exists public.promotion_usage;
drop table if exists public.order_status_history;
drop table if exists public.order_items;
drop table if exists public.orders;

drop table if exists public.recently_viewed;
drop table if exists public.comparison_lists;
drop table if exists public.user_addresses;
drop table if exists public.user_payment_methods;
drop table if exists public.user_notification_preferences;
drop table if exists public.user_activity_log;

drop table if exists public.quote_lines;
drop table if exists public.quotes;

drop table if exists public.cart_items;
drop table if exists public.carts;
drop table if exists public.wishlists;
drop table if exists public.product_reviews;

drop table if exists public.up_onboarding_tickets;
drop table if exists public.up_delivery_integrations;
drop table if exists public.urban_piper_subscriptions;
drop table if exists public.promotions;

-- Inventory & dynamic pricing (admin schema)
drop table if exists public.stock_movements;
drop table if exists public.inventory_items;
drop table if exists public.price_change_history;
drop table if exists public.pricing_rules;

-- Stripe-style subscriptions (RH customers)
drop table if exists public.customer_subscriptions;
drop table if exists public.subscription_plans;

-- Billing (RH customers)
drop table if exists public.billing_payments;
drop table if exists public.billing_payment_methods;
drop table if exists public.billing_subscriptions;
drop table if exists public.customer_profiles;
drop table if exists public.billing_plans;

-- B2B customer pricing tiers
drop table if exists public.customer_price_tiers;
drop table if exists public.customer_product_prices;
drop table if exists public.customer_category_discounts;
drop table if exists public.volume_pricing;
drop table if exists public.customer_payment_terms;
drop table if exists public.price_tiers;

-- Marketing contacts list (campaigns/automations kept)
drop table if exists public.email_contacts;

-- Catalog
drop table if exists public.products;
drop table if exists public.product_categories;

-- Tenant-scoped RH core
drop table if exists public.integrations;
drop table if exists public.locations;

-- Guest / shop buyers (before customers)
drop table if exists public.guest_sessions;
drop table if exists public.shop_customers;

drop table if exists public.customers;

-- Other RH-only tables (old realtime room chat; not Crypto Pay chat_messages)
drop table if exists public.visitor_sessions;
drop table if exists public.system_metrics;

do $$
begin
  if to_regclass('public.messages') is not null then
    execute 'drop policy if exists room_members_can_read on public.messages';
    execute 'drop policy if exists room_members_can_write on public.messages';
    execute 'drop policy if exists room_members_can_update on public.messages';
    execute 'drop policy if exists room_members_can_delete on public.messages';
  end if;
  if to_regclass('realtime.messages') is not null then
    execute 'drop policy if exists realtime_room_members_can_read on realtime.messages';
    execute 'drop policy if exists realtime_room_members_can_write on realtime.messages';
  end if;
  if to_regclass('public.room_members') is not null then
    execute 'drop policy if exists room_members_self_insert on public.room_members';
    execute 'drop policy if exists room_members_self_read on public.room_members';
  end if;
end $$;

drop table if exists public.messages;
drop table if exists public.room_members;

-- ---------------------------------------------------------------------------
-- Sequences
-- ---------------------------------------------------------------------------
drop sequence if exists public.order_number_seq;

-- ---------------------------------------------------------------------------
-- Legacy functions (portal does not call these)
-- ---------------------------------------------------------------------------
drop function if exists public.get_customer_price(uuid, uuid, integer, numeric);
drop function if exists public.generate_order_number();
drop function if exists public.log_order_status_change();
drop function if exists public.upsert_recently_viewed(uuid, uuid);
drop function if exists public.ensure_single_default_address();
drop function if exists public.get_user_order_stats(uuid);
drop function if exists public.update_product_sales();
drop function if exists public.update_customer_order_stats();
drop function if exists public.convert_guest_to_customer(uuid, uuid);
drop function if exists public.update_cart_totals();
drop function if exists public.update_product_review_stats();

commit;
