-- 003_refine_tables.sql

-- 1. Create users table (Clerk mapping)
-- This allows multiple users per tenant in the future, even if currently restricted to 1.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  clerk_user_id text not null unique,
  email text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create error_logs table (Specific table for system/db errors as requested)
create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  error_code text not null,
  message text,
  details jsonb default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- 3. Enable RLS
alter table users enable row level security;
alter table error_logs enable row level security;

-- 4. Update helper function to use users table
-- This is more efficient if the JWT 'sub' is indexed in the users table.
create or replace function auth_involved_tenants()
returns setof uuid
language sql
stable
security definer
as $$
  select tenant_id from users 
  where clerk_user_id = (auth.jwt() ->> 'sub')
  union
  -- Fallback to the legacy/simple owner mapping on tenants table
  select id from tenants 
  where owner_clerk_user_id = (auth.jwt() ->> 'sub');
$$;

-- 5. Policies
create policy "User can view own record"
on users for select
using (clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "Users can view logs of their tenant"
on error_logs for select
using (tenant_id in (select auth_involved_tenants()));

-- 6. Indexes
create index if not exists idx_users_clerk_id on users (clerk_user_id);
create index if not exists idx_error_logs_tenant_time on error_logs (tenant_id, occurred_at desc);

-- 7. Seed initial users from existing tenants (Migration logic)
insert into users (tenant_id, clerk_user_id, role)
select id, owner_clerk_user_id, 'admin'
from tenants
on conflict (clerk_user_id) do nothing;
