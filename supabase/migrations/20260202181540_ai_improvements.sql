drop extension if exists "pg_cron";

drop extension if exists "pg_net";

drop trigger if exists "trigger_log_profile_changes" on "public"."user_profiles";

drop trigger if exists "trigger_update_last_login" on "public"."user_sessions";

drop policy if exists "orders_session_validation" on "public"."orders";

drop policy if exists "user_profiles_session_validation" on "public"."user_profiles";

drop policy if exists "user_security_events_insert" on "public"."user_security_events";

drop policy if exists "user_security_events_select" on "public"."user_security_events";

drop policy if exists "user_sessions_delete" on "public"."user_sessions";

drop policy if exists "user_sessions_insert" on "public"."user_sessions";

drop policy if exists "user_sessions_select" on "public"."user_sessions";

drop policy if exists "customers_select_members" on "public"."customers";

drop policy if exists "customers_update_owner" on "public"."customers";

drop policy if exists "integrations_delete_manager" on "public"."integrations";

drop policy if exists "integrations_insert_manager" on "public"."integrations";

drop policy if exists "integrations_select_members" on "public"."integrations";

drop policy if exists "integrations_update_manager" on "public"."integrations";

drop policy if exists "locations_delete_manager" on "public"."locations";

drop policy if exists "locations_insert_manager" on "public"."locations";

drop policy if exists "locations_select_members" on "public"."locations";

drop policy if exists "locations_update_manager" on "public"."locations";

drop policy if exists "memberships_update_owner" on "public"."memberships";

drop policy if exists "memberships_write_owner" on "public"."memberships";

drop policy if exists "products_delete_admin" on "public"."products";

drop policy if exists "products_insert_admin" on "public"."products";

drop policy if exists "products_update_admin" on "public"."products";

drop policy if exists "quote_lines_delete_manager" on "public"."quote_lines";

drop policy if exists "quote_lines_insert_manager" on "public"."quote_lines";

drop policy if exists "quote_lines_select_members" on "public"."quote_lines";

drop policy if exists "quote_lines_update_manager" on "public"."quote_lines";

drop policy if exists "quotes_delete_manager" on "public"."quotes";

drop policy if exists "quotes_insert_manager" on "public"."quotes";

drop policy if exists "quotes_select_members" on "public"."quotes";

drop policy if exists "quotes_update_manager" on "public"."quotes";

drop policy if exists "tenants_update_owner" on "public"."tenants";

-- Conditionally revoke permissions only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rate_limit_buckets') THEN
    REVOKE DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."rate_limit_buckets" FROM "anon";
    REVOKE DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."rate_limit_buckets" FROM "authenticated";
    REVOKE DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."rate_limit_buckets" FROM "service_role";
    
    -- Drop constraints and indexes if table exists
    EXECUTE 'ALTER TABLE public.rate_limit_buckets DROP CONSTRAINT IF EXISTS rate_limit_buckets_key_window_start_key';
    EXECUTE 'ALTER TABLE public.rate_limit_buckets DROP CONSTRAINT IF EXISTS rate_limit_buckets_pkey';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_rate_limit_key_window';
    EXECUTE 'DROP INDEX IF EXISTS public.rate_limit_buckets_key_window_start_key';
    EXECUTE 'DROP INDEX IF EXISTS public.rate_limit_buckets_pkey';
    
    -- Drop the table
    DROP TABLE public.rate_limit_buckets;
  END IF;
END $$;

alter table "public"."user_security_events" drop constraint "user_security_events_user_id_fkey";

alter table "public"."user_sessions" drop constraint "user_sessions_user_id_fkey";

drop function if exists "public"."check_rate_limit"(p_key text, p_max_hits integer, p_window_duration interval);

drop function if exists "public"."cleanup_old_avatars"();

drop function if exists "public"."clear_profile_avatar_url"();

drop function if exists "public"."detect_suspicious_login"(p_user_id uuid, p_ip_address inet, p_user_agent text);

drop function if exists "public"."get_avatar_url"(user_id uuid);

drop function if exists "public"."log_profile_changes"();

drop function if exists "public"."log_security_event"(p_user_id uuid, p_event_type text, p_ip_address inet, p_user_agent text, p_metadata jsonb);

drop function if exists "public"."sync_profile_avatar_url"();

drop function if exists "public"."update_last_login"();

drop function if exists "public"."validate_password_strength"(password text);

drop view if exists "public"."chat_leads_summary";

drop view if exists "public"."security_dashboard";

-- Drop indexes on tables that still exist
drop index if exists "public"."idx_security_events_created_at";
drop index if exists "public"."idx_security_events_type";
drop index if exists "public"."idx_security_events_user_id";
drop index if exists "public"."idx_security_events_user_type";
drop index if exists "public"."idx_user_sessions_expires";
drop index if exists "public"."idx_user_sessions_token";

-- rate_limit_buckets table operations already handled above

-- Drop columns from user_profiles only if they exist
alter table "public"."user_profiles" drop column if exists "account_locked_until";
alter table "public"."user_profiles" drop column if exists "backup_codes";
alter table "public"."user_profiles" drop column if exists "email_verified_at";
alter table "public"."user_profiles" drop column if exists "failed_login_attempts";
alter table "public"."user_profiles" drop column if exists "last_login_at";
alter table "public"."user_profiles" drop column if exists "last_login_ip";
alter table "public"."user_profiles" drop column if exists "last_password_change";
alter table "public"."user_profiles" drop column if exists "password_reset_requested_at";
alter table "public"."user_profiles" drop column if exists "two_factor_enabled";
alter table "public"."user_profiles" drop column if exists "two_factor_secret";

-- Handle user_security_events metadata -> details rename
DO $$
BEGIN
  -- Drop metadata if it exists, add details if it doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'user_security_events' AND column_name = 'metadata') THEN
    ALTER TABLE "public"."user_security_events" DROP COLUMN "metadata";
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'user_security_events' AND column_name = 'details') THEN
    ALTER TABLE "public"."user_security_events" ADD COLUMN "details" jsonb default '{}'::jsonb;
  END IF;
END $$;

alter table "public"."user_security_events" alter column "event_type" set data type character varying(50) using "event_type"::character varying(50);

-- Drop columns from user_sessions only if they exist
alter table "public"."user_sessions" drop column if exists "browser";
alter table "public"."user_sessions" drop column if exists "device_name";
alter table "public"."user_sessions" drop column if exists "device_type";
alter table "public"."user_sessions" drop column if exists "last_active_at";
alter table "public"."user_sessions" drop column if exists "location_city";
alter table "public"."user_sessions" drop column if exists "location_country";
alter table "public"."user_sessions" drop column if exists "os";

-- Add columns to user_sessions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'user_sessions' AND column_name = 'last_activity_at') THEN
    ALTER TABLE "public"."user_sessions" ADD COLUMN "last_activity_at" timestamp with time zone default now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'user_sessions' AND column_name = 'user_agent') THEN
    ALTER TABLE "public"."user_sessions" ADD COLUMN "user_agent" text;
  END IF;
END $$;

alter table "public"."user_sessions" alter column "session_token" set data type character varying(255) using "session_token"::character varying(255);

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_admin_invites_invited_by ON public.admin_invites USING btree (invited_by);

CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON public.audit_log USING btree (tenant_id);

CREATE INDEX IF NOT EXISTS idx_billing_payments_subscription_id ON public.billing_payments USING btree (subscription_id);

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_plan_id ON public.billing_subscriptions USING btree (plan_id);

CREATE INDEX IF NOT EXISTS idx_customer_category_discounts_created_by ON public.customer_category_discounts USING btree (created_by);

CREATE INDEX IF NOT EXISTS idx_customer_payment_terms_approved_by ON public.customer_payment_terms USING btree (approved_by);

CREATE INDEX IF NOT EXISTS idx_customer_price_tiers_created_by ON public.customer_price_tiers USING btree (created_by);

CREATE INDEX IF NOT EXISTS idx_customer_product_prices_created_by ON public.customer_product_prices USING btree (created_by);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_converted_to_customer_id ON public.guest_sessions USING btree (converted_to_customer_id);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_created_at ON public.guest_sessions USING btree (created_at);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_tenant_id ON public.guest_sessions USING btree (tenant_id);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_utm_source ON public.guest_sessions USING btree (utm_source);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user_id ON public.newsletter_subscribers USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_by ON public.order_status_history USING btree (changed_by);

CREATE INDEX IF NOT EXISTS idx_orders_guest_session_id ON public.orders USING btree (guest_session_id);

CREATE INDEX IF NOT EXISTS idx_orders_promotion_id ON public.orders USING btree (promotion_id);

CREATE INDEX IF NOT EXISTS idx_promotion_usage_promotion_id ON public.promotion_usage USING btree (promotion_id);

CREATE INDEX IF NOT EXISTS idx_promotion_usage_quote_id ON public.promotion_usage USING btree (quote_id);

CREATE INDEX IF NOT EXISTS idx_promotion_usage_user_id ON public.promotion_usage USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_quote_lines_product_id ON public.quote_lines USING btree (product_id);

CREATE INDEX IF NOT EXISTS idx_quotes_location_id ON public.quotes USING btree (location_id);

CREATE INDEX IF NOT EXISTS idx_shop_customers_created_at ON public.shop_customers USING btree (created_at);

CREATE INDEX IF NOT EXISTS idx_shop_customers_tenant_id ON public.shop_customers USING btree (tenant_id);

CREATE INDEX IF NOT EXISTS idx_shop_customers_user_id ON public.shop_customers USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_up_onboarding_tickets_assigned_to ON public.up_onboarding_tickets USING btree (assigned_to);

CREATE INDEX IF NOT EXISTS idx_up_onboarding_tickets_customer_id ON public.up_onboarding_tickets USING btree (customer_id);

CREATE INDEX IF NOT EXISTS idx_up_onboarding_tickets_subscription_id ON public.up_onboarding_tickets USING btree (subscription_id);

CREATE INDEX IF NOT EXISTS idx_volume_pricing_tier_id ON public.volume_pricing USING btree (tier_id);

alter table "public"."user_security_events" add constraint "user_security_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_security_events" validate constraint "user_security_events_user_id_fkey";

alter table "public"."user_sessions" add constraint "user_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_sessions" validate constraint "user_sessions_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_hanouta_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'hanouta_admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

create or replace view "public"."chat_leads_summary" as  SELECT c.id,
    c.session_id,
    COALESCE(c.guest_name, up.full_name, 'Anonymous'::text) AS name,
    COALESCE(c.guest_email, up.email) AS email,
    c.guest_phone AS phone,
    c.is_guest,
    c.status,
    c.lead_status,
    c.lead_score,
    c.interested_in,
    c.contact_captured,
    c.message_count,
    c.started_at,
    c.ended_at,
    c.assigned_to,
    assigned_user.full_name AS assigned_to_name,
    c.internal_notes,
    c.follow_up_date,
    c.follow_up_completed,
    c.created_at,
    c.updated_at
   FROM ((public.chat_conversations c
     LEFT JOIN public.user_profiles up ON ((c.user_id = up.id)))
     LEFT JOIN public.user_profiles assigned_user ON ((c.assigned_to = assigned_user.id)))
  ORDER BY c.created_at DESC;


create or replace view "public"."security_dashboard" as  SELECT up.id,
    up.email,
    up.created_at,
    up.updated_at,
    count(DISTINCT us.id) AS active_sessions,
    count(DISTINCT
        CASE
            WHEN (((use.event_type)::text = 'failed_login'::text) AND (use.created_at > (now() - '24:00:00'::interval))) THEN use.id
            ELSE NULL::uuid
        END) AS failed_logins_24h,
    max(
        CASE
            WHEN ((use.event_type)::text = 'login'::text) THEN use.created_at
            ELSE NULL::timestamp with time zone
        END) AS last_successful_login,
    max(
        CASE
            WHEN ((use.event_type)::text = 'failed_login'::text) THEN use.created_at
            ELSE NULL::timestamp with time zone
        END) AS last_failed_login
   FROM ((public.user_profiles up
     LEFT JOIN public.user_sessions us ON (((us.user_id = up.id) AND (us.expires_at > now()))))
     LEFT JOIN public.user_security_events use ON ((use.user_id = up.id)))
  GROUP BY up.id, up.email, up.created_at, up.updated_at;



  create policy "customers_select_members"
  on "public"."customers"
  as permissive
  for select
  to public
using ((public.is_member_of_tenant(id) OR public.is_hanouta_admin()));



  create policy "customers_update_owner"
  on "public"."customers"
  as permissive
  for update
  to public
using ((public.has_tenant_role(id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()))
with check ((public.has_tenant_role(id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "integrations_delete_manager"
  on "public"."integrations"
  as permissive
  for delete
  to public
using ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "integrations_insert_manager"
  on "public"."integrations"
  as permissive
  for insert
  to public
with check ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "integrations_select_members"
  on "public"."integrations"
  as permissive
  for select
  to public
using ((public.is_member_of_tenant(customer_id) OR public.is_hanouta_admin()));



  create policy "integrations_update_manager"
  on "public"."integrations"
  as permissive
  for update
  to public
using ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()))
with check ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "locations_delete_manager"
  on "public"."locations"
  as permissive
  for delete
  to public
using ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "locations_insert_manager"
  on "public"."locations"
  as permissive
  for insert
  to public
with check ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "locations_select_members"
  on "public"."locations"
  as permissive
  for select
  to public
using ((public.is_member_of_tenant(customer_id) OR public.is_hanouta_admin()));



  create policy "locations_update_manager"
  on "public"."locations"
  as permissive
  for update
  to public
using ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()))
with check ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "memberships_update_owner"
  on "public"."memberships"
  as permissive
  for update
  to public
using (public.has_tenant_role(tenant_id, ARRAY['owner'::text, 'hanouta_admin'::text]))
with check (public.has_tenant_role(tenant_id, ARRAY['owner'::text, 'hanouta_admin'::text]));



  create policy "memberships_write_owner"
  on "public"."memberships"
  as permissive
  for insert
  to public
with check (public.has_tenant_role(tenant_id, ARRAY['owner'::text, 'hanouta_admin'::text]));



  create policy "products_delete_admin"
  on "public"."products"
  as permissive
  for delete
  to public
using (public.is_hanouta_admin());



  create policy "products_insert_admin"
  on "public"."products"
  as permissive
  for insert
  to public
with check (public.is_hanouta_admin());



  create policy "products_update_admin"
  on "public"."products"
  as permissive
  for update
  to public
using (public.is_hanouta_admin())
with check (public.is_hanouta_admin());



  create policy "quote_lines_delete_manager"
  on "public"."quote_lines"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_lines.quote_id) AND (public.has_tenant_role(q.customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin())))));



  create policy "quote_lines_insert_manager"
  on "public"."quote_lines"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_lines.quote_id) AND (public.has_tenant_role(q.customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin())))));



  create policy "quote_lines_select_members"
  on "public"."quote_lines"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_lines.quote_id) AND (public.is_member_of_tenant(q.customer_id) OR public.is_hanouta_admin())))));



  create policy "quote_lines_update_manager"
  on "public"."quote_lines"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_lines.quote_id) AND (public.has_tenant_role(q.customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin())))))
with check ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_lines.quote_id) AND (public.has_tenant_role(q.customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin())))));



  create policy "quotes_delete_manager"
  on "public"."quotes"
  as permissive
  for delete
  to public
using ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "quotes_insert_manager"
  on "public"."quotes"
  as permissive
  for insert
  to public
with check ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "quotes_select_members"
  on "public"."quotes"
  as permissive
  for select
  to public
using ((public.is_member_of_tenant(customer_id) OR public.is_hanouta_admin()));



  create policy "quotes_update_manager"
  on "public"."quotes"
  as permissive
  for update
  to public
using ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()))
with check ((public.has_tenant_role(customer_id, ARRAY['owner'::text, 'manager'::text, 'hanouta_admin'::text]) OR public.is_hanouta_admin()));



  create policy "tenants_update_owner"
  on "public"."tenants"
  as permissive
  for update
  to public
using (public.has_tenant_role(id, ARRAY['owner'::text, 'hanouta_admin'::text]))
with check (public.has_tenant_role(id, ARRAY['owner'::text, 'hanouta_admin'::text]));


drop trigger if exists "cleanup_old_avatars_trigger" on "storage"."objects";

drop trigger if exists "clear_profile_avatar_url_trigger" on "storage"."objects";

drop trigger if exists "sync_profile_avatar_url_trigger" on "storage"."objects";

drop policy if exists "Avatars are publicly accessible" on "storage"."objects";

drop policy if exists "Users can delete their own avatar" on "storage"."objects";

drop policy if exists "Users can update their own avatar" on "storage"."objects";

drop policy if exists "Users can upload their own avatar" on "storage"."objects";


