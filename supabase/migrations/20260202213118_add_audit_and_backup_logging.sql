-- Enable pg_cron extension for automated backups (requires pg_cron installed)
create extension if not exists pg_cron;

-- audit_logs may already exist from super_admin_system (action/user_id schema).
-- Only create the newer event_type schema on greenfield databases.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    CREATE TABLE public.audit_logs (
      id uuid primary key default gen_random_uuid(),
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now(),
      event_type text not null,
      severity text not null default 'info',
      actor_id uuid references auth.users(id) on delete set null,
      actor_email text,
      resource_type text,
      resource_id uuid,
      description text,
      metadata jsonb default '{}'::jsonb,
      request_path text,
      request_method text,
      ip_address inet,
      user_agent text,
      status text default 'success',
      error_message text
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'event_type'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
    CREATE POLICY "Users can view their own audit logs"
      ON public.audit_logs
      FOR SELECT
      TO authenticated
      USING (
        actor_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role = 'rhs_admin'
        )
      );

    DROP POLICY IF EXISTS "Only service role can insert audit logs" ON public.audit_logs;
    CREATE POLICY "Only service role can insert audit logs"
      ON public.audit_logs
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

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
create index if not exists idx_backup_logs_created_at on public.backup_logs(created_at desc);
create index if not exists idx_backup_logs_status on public.backup_logs(status);

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
