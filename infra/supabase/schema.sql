-- LeadOps AI — Comprehensive Reference Schema (Supabase/Postgres)
-- This file represents the target state of the database.

create extension if not exists "pgcrypto";

-- Enum Types
do $$ begin
  create type event_type as enum (
    'EMAIL_SENT','EMAIL_DELIVERED','EMAIL_BOUNCED','EMAIL_OPENED','EMAIL_REPLIED','EMAIL_NO_REPLY',
    'CALL_OUTBOUND_STARTED','CALL_OUTBOUND_CONNECTED','CALL_INBOUND_RECEIVED','CALL_ENDED',
    'MEETING_BOOKED_EMAIL','MEETING_BOOKED_PHONE','MEETING_CANCELED',
    'CAMPAIGN_STARTED','CAMPAIGN_PAUSED','CAMPAIGN_COMPLETED',
    'DEAL_OPENED','DEAL_WON','DEAL_LOST',
    'PRODUCT_INTERESTED','PRODUCT_SOLD',
    'ERROR_RECORDED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('NEW','CONTACTED','ENGAGED','NEGOTIATION','FOLLOW_UP','WON','LOST','DORMANT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_source as enum ('n8n','manual','gmail','vapi','twilio','calendly','system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type channel_type as enum ('COLD_EMAIL','INBOUND_EMAIL','PHONE_CALL','CALENDLY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type error_code as enum ('PROVIDER_AUTH','PROVIDER_TIMEOUT','PROVIDER_RATE_LIMIT','INVALID_SIGNATURE','INVALID_SCHEMA','DUPLICATE_EVENT','DB_CONSTRAINT','MAPPING_ERROR','DELIVERY_FAILURE');
exception when duplicate_object then null; end $$;


-- Tables

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  owner_clerk_user_id text not null unique,
  name text not null default 'Default Tenant',
  webhook_secret text not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  clerk_user_id text not null unique,
  email text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text,
  email text,
  phone text,
  company text,
  status lead_status not null default 'NEW',
  agent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email),
  unique (tenant_id, phone)
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  channel channel_type not null,
  started_at timestamptz,
  ended_at timestamptz
);

create table if not exists products_services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text
);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  status text not null default 'OPEN',
  value_cents bigint not null default 0,
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  occurred_at timestamptz not null, -- event_time (source)
  event_type event_type not null,
  source event_source not null,
  channel channel_type,
  idempotency_key text not null,
  lead_id uuid references leads(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  product_service_id uuid references products_services(id) on delete set null,
  agent_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), -- received_time (system)
  processed_at timestamptz, -- processed_time
  unique (tenant_id, idempotency_key)
);

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

create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  error_code text not null,
  message text,
  details jsonb default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Indexes
create index if not exists idx_events_tenant_time on events(tenant_id, occurred_at desc);
create index if not exists idx_events_lookup on events (tenant_id, event_type, occurred_at);
create index if not exists idx_leads_tenant_status on leads (tenant_id, status);
create index if not exists idx_users_clerk_id on users (clerk_user_id);

-- Views
create or replace view analytics_kpi_daily as
select
  tenant_id,
  date_trunc('day', occurred_at) as day,
  event_type,
  count(*) as event_count
from events
group by 1, 2, 3;

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
