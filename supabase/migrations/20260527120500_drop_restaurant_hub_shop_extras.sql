-- Drop legacy Restaurant Hub "shop" extension tables that are unused in Crypto Pay.
-- This removes carts/wishlists/reviews/promotions/UrbanPiper tables plus their triggers/functions.

begin;

-- Some later migrations may reference these function names (e.g. security hardening).
-- To keep those migrations idempotent, we replace them with no-op stubs after
-- dropping tables/triggers, then drop the stubs at the very end if desired.

-- Drop triggers first (safe even if tables already gone)
drop trigger if exists product_categories_set_updated_at on public.product_categories;
drop trigger if exists product_reviews_set_updated_at on public.product_reviews;
drop trigger if exists carts_set_updated_at on public.carts;
drop trigger if exists cart_items_set_updated_at on public.cart_items;
drop trigger if exists up_subscriptions_set_updated_at on public.urban_piper_subscriptions;
drop trigger if exists up_delivery_set_updated_at on public.up_delivery_integrations;
drop trigger if exists up_onboarding_set_updated_at on public.up_onboarding_tickets;
drop trigger if exists promotions_set_updated_at on public.promotions;

drop trigger if exists trigger_update_product_review_stats on public.product_reviews;
drop trigger if exists trigger_update_cart_totals on public.cart_items;

-- Drop tables (indexes + RLS policies are dropped with their tables)
-- orders.promotion_id FK must go before promotions (orders dropped in core migration)
alter table if exists public.orders drop constraint if exists orders_promotion_id_fkey;

drop table if exists public.promotion_usage;
drop table if exists public.promotions;

drop table if exists public.up_onboarding_tickets;
drop table if exists public.up_delivery_integrations;
drop table if exists public.urban_piper_subscriptions;

drop table if exists public.wishlists;
drop table if exists public.cart_items;
drop table if exists public.carts;

drop table if exists public.product_reviews;

alter table if exists public.products drop constraint if exists products_category_id_fkey;
drop table if exists public.product_categories;

-- Keep function names referenced by later migrations, but as no-ops.
-- (Later we can remove these names from those migrations and fully drop.)
create or replace function public.update_cart_totals()
returns trigger
language plpgsql
as $$
begin
  return coalesce(new, old);
end;
$$;

create or replace function public.update_product_review_stats()
returns trigger
language plpgsql
as $$
begin
  return coalesce(new, old);
end;
$$;

commit;

