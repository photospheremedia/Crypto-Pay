-- Rename legacy Restaurant Hub admin tenant to Crypto Pay branding
update public.tenants
set
  name = 'Crypto Pay Admin',
  slug = 'crypto-pay-admin'
where slug = 'rhs-admin';

-- Marketing email sender defaults
update public.email_campaigns
set from_name = 'Crypto Pay'
where from_name ilike '%restaurant hub%';

update public.email_automations
set from_name = 'Crypto Pay'
where from_name ilike '%restaurant hub%';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'email_campaigns' and column_name = 'from_name'
  ) then
    alter table public.email_campaigns alter column from_name set default 'Crypto Pay';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'email_automations' and column_name = 'from_name'
  ) then
    alter table public.email_automations alter column from_name set default 'Crypto Pay';
  end if;
end $$;
