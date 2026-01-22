-- LeadOps AI — RLS Policies Reference

-- Enable RLS on all tables
alter table tenants enable row level security;
alter table users enable row level security;
alter table leads enable row level security;
alter table campaigns enable row level security;
alter table products_services enable row level security;
alter table deals enable row level security;
alter table events enable row level security;
alter table job_runs enable row level security;
alter table error_logs enable row level security;

-- Helper function for tenant isolation
create or replace function auth_involved_tenants()
returns setof uuid
language sql
stable
security definer
as $$
  select tenant_id from users 
  where clerk_user_id = (auth.jwt() ->> 'sub')
  union
  select id from tenants 
  where owner_clerk_user_id = (auth.jwt() ->> 'sub');
$$;

-- Policies

-- Tenants
create policy "Owner can view own tenant" on tenants for select
using (owner_clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "Owner can update own tenant" on tenants for update
using (owner_clerk_user_id = (auth.jwt() ->> 'sub'));

-- Users
create policy "User can view own record" on users for select
using (clerk_user_id = (auth.jwt() ->> 'sub'));

-- Generic Tenant Isolation Policies
create policy "Tenant access leads" on leads for all
using (tenant_id in (select auth_involved_tenants()));

create policy "Tenant access campaigns" on campaigns for all
using (tenant_id in (select auth_involved_tenants()));

create policy "Tenant access products" on products_services for all
using (tenant_id in (select auth_involved_tenants()));

create policy "Tenant access deals" on deals for all
using (tenant_id in (select auth_involved_tenants()));

create policy "Tenant access events" on events for all
using (tenant_id in (select auth_involved_tenants()));

create policy "Tenant access job_runs" on job_runs for all
using (tenant_id in (select auth_involved_tenants()));

create policy "Tenant access error_logs" on error_logs for all
using (tenant_id in (select auth_involved_tenants()));
