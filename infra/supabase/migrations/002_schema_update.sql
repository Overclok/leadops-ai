-- 002_schema_update.sql

-- 1. Add missing columns to events
alter table events add column if not exists processed_at timestamptz;

-- 2. Create job_runs table
create table if not exists job_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  job_name text not null,
  status text not null check (status in ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  result jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Enable RLS on job_runs (others already enabled in 001)
alter table job_runs enable row level security;

-- 4. Create RLS Policies
-- We assume Supabase Auth with Clerk integration where the JWT 'sub' claim is the Clerk User ID.
-- We check if the accessing user (auth.jwt()->>'sub') matches the tenant owner.

-- Helper function to avoid repetition (optional, but clean)
-- Returns the set of tenant_ids owned by the current user (usually just one)
create or replace function auth_involved_tenants()
returns setof uuid
language sql
stable
security definer
as $$
  select id from tenants 
  where owner_clerk_user_id = (auth.jwt() ->> 'sub');
$$;

-- Tenants: Owner can view/update their own tenant record
create policy "Owner can view own tenant"
on tenants for select
using (owner_clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "Owner can update own tenant"
on tenants for update
using (owner_clerk_user_id = (auth.jwt() ->> 'sub'));

-- Leads
create policy "Owner can all leads"
on leads for all
using (tenant_id in (select auth_involved_tenants()));

-- Campaigns
create policy "Owner can all campaigns"
on campaigns for all
using (tenant_id in (select auth_involved_tenants()));

-- Products Services
create policy "Owner can all products"
on products_services for all
using (tenant_id in (select auth_involved_tenants()));

-- Deals
create policy "Owner can all deals"
on deals for all
using (tenant_id in (select auth_involved_tenants()));

-- Events
create policy "Owner can all events"
on events for all
using (tenant_id in (select auth_involved_tenants()));

-- Job Runs
create policy "Owner can all job_runs"
on job_runs for all
using (tenant_id in (select auth_involved_tenants()));


-- 5. Indexes for performance and deterministic metrics
create index if not exists idx_events_lookup on events (tenant_id, event_type, occurred_at);
create index if not exists idx_events_metrics on events (tenant_id, event_type, created_at);
create index if not exists idx_leads_tenant_status on leads (tenant_id, status);
create index if not exists idx_job_runs_tenant_status on job_runs (tenant_id, status);


-- 6. Views for Dashboard Aggregates (Minimal Set)

-- KPI Daily View
create or replace view analytics_kpi_daily as
select
  tenant_id,
  date_trunc('day', occurred_at) as day,
  event_type,
  count(*) as event_count
from events
group by 1, 2, 3;

-- Errors View
create or replace view errors_view as
select
  id,
  tenant_id,
  occurred_at,
  payload ->> 'error_code' as error_code,
  payload ->> 'details' as details,
  processed_at
from events
where event_type = 'ERROR_RECORDED';

-- Grant access to views (Views run with permissions of the invoker by default for simple views, 
-- so RLS on underlying tables applies automatically).
