-- Drop remaining legacy Restaurant Hub tables that Crypto Pay no longer uses.
-- This intentionally removes the old "shop" core (customers/locations/integrations/products/quotes/orders)
-- and their dependent tables, sequences, triggers, and helper functions.

begin;

-- Drop triggers (safe even if objects already gone)
drop trigger if exists customers_set_updated_at on public.customers;
drop trigger if exists locations_set_updated_at on public.locations;
drop trigger if exists integrations_set_updated_at on public.integrations;
drop trigger if exists products_set_updated_at on public.products;
drop trigger if exists quotes_set_updated_at on public.quotes;

drop trigger if exists set_order_number on public.orders;
drop trigger if exists trigger_log_order_status on public.orders;
drop trigger if exists trigger_single_default_address on public.user_addresses;

-- Drop dependent tables first
drop table if exists public.order_status_history;
drop table if exists public.order_items;
drop table if exists public.orders;

drop table if exists public.recently_viewed;
drop table if exists public.comparison_lists;
drop table if exists public.user_addresses;

drop table if exists public.quote_lines;
drop table if exists public.quotes;

-- Billing/inventory tables (legacy admin) reference products — drop before products
drop table if exists public.stock_movements;
drop table if exists public.inventory_items;
drop table if exists public.price_change_history;

drop table if exists public.pricing_rules;
drop table if exists public.products;
drop table if exists public.product_categories;

drop table if exists public.integrations;
drop table if exists public.locations;

-- Billing / B2B pricing (FK → customers)
drop table if exists public.customer_subscriptions;
drop table if exists public.subscription_plans;
drop table if exists public.billing_payments;
drop table if exists public.billing_payment_methods;
drop table if exists public.billing_subscriptions;
drop table if exists public.customer_profiles;
drop table if exists public.billing_plans;
drop table if exists public.customer_price_tiers;
drop table if exists public.customer_product_prices;
drop table if exists public.customer_category_discounts;
drop table if exists public.volume_pricing;
drop table if exists public.customer_payment_terms;
drop table if exists public.price_tiers;
drop view if exists public.customer_analytics;
drop table if exists public.guest_sessions;
drop table if exists public.shop_customers;

drop table if exists public.customers;

-- Sequence(s)
drop sequence if exists public.order_number_seq;

-- Functions used by dropped triggers / legacy flows
drop function if exists public.generate_order_number();
drop function if exists public.log_order_status_change();
drop function if exists public.upsert_recently_viewed(uuid, uuid);
drop function if exists public.ensure_single_default_address();

commit;

