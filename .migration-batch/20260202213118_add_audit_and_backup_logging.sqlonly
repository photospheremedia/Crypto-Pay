-- Enable pg_cron extension for automated backups (requires pg_cron installed)
create extension if not exists pg_cron;

-- Create audit log table for tracking application events
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Core audit fields
  event_type text not null, -- 'order_created', 'payment_processed', 'user_registered', etc.
  severity text not null default 'info', -- 'debug', 'info', 'warning', 'error'
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  
  -- Resource information
  resource_type text, -- 'order', 'user', 'product', 'subscription'
  resource_id uuid,
  
  -- Event details
  description text,
  metadata jsonb default '{}'::jsonb,
  
  -- API/Request info
  request_path text,
  request_method text,
  ip_address inet,
  user_agent text,
  
  -- Status tracking
  status text default 'success', -- 'success', 'failed', 'pending'
  error_message text
);

-- Create indexes for efficient querying
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index idx_audit_logs_event_type on public.audit_logs(event_type);
create index idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index idx_audit_logs_resource on public.audit_logs(resource_type, resource_id);
create index idx_audit_logs_severity on public.audit_logs(severity);

-- Enable RLS for audit logs
alter table public.audit_logs enable row level security;

-- Only authenticated users can view their own audit logs (or admins can view all)
create policy "Users can view their own audit logs"
  on public.audit_logs
  for select
  to authenticated
  using (
    actor_id = auth.uid()
    or exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'rhs_admin'
    )
  );

-- Only system/service can insert audit logs
create policy "Only service role can insert audit logs"
  on public.audit_logs
  for insert
  to service_role
  with check (true);

-- Create backup metadata table
create table if not exists public.backup_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  
  -- Backup info
  backup_type text not null, -- 'full', 'incremental', 'schema', 'data'
  status text not null default 'in_progress', -- 'success', 'failed', 'in_progress'
  
  -- Storage info
  storage_path text, -- gs://bucket/path or supabase://path
  storage_size_bytes bigint,
  
  -- Timing
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  duration_seconds integer,
  
  -- Details
  table_count integer,
  row_count bigint,
  error_message text,
  metadata jsonb default '{}'::jsonb
);

-- Create index for recent backups
create index idx_backup_logs_created_at on public.backup_logs(created_at desc);
create index idx_backup_logs_status on public.backup_logs(status);

-- Scheduled job to clean up old audit logs (keep last 90 days)
select cron.schedule('cleanup-audit-logs', '0 2 * * *', $$
  delete from public.audit_logs
  where created_at < now() - interval '90 days'
$$);

-- Scheduled job to clean up old backup logs (keep last 30 days for failed, all success)
select cron.schedule('cleanup-backup-logs', '0 3 * * *', $$
  delete from public.backup_logs
  where status = 'failed'
    and created_at < now() - interval '30 days'
$$);
