# Supabase Infrastructure

This directory contains the Supabase configuration and migration files for LeadOps AI.

## Migrations

The database schema is managed via SQL migrations in the `migrations/` folder.

- `001_init.sql`: Initial schema setup (Tables, Enums, Basic RLS Setup).
- `002_schema_update.sql`: `job_runs` table, Indexes, and KPI Views.
- `003_refine_tables.sql`: `users` mapping table, `error_logs` table, and refined RLS helper.

## Reference Files

- `schema.sql`: Cumulative database schema (DDL) for all tables and views.
- `policies.sql`: Reference for all RLS policies and the `auth_involved_tenants()` helper.

## Applying Migrations

### Local / Development
1. Ensure you have the Supabase CLI installed or use the SQL Editor in the Supabase Dashboard.
2. Apply the files in order:
   - Run `migrations/001_init.sql`
   - Run `migrations/002_schema_update.sql`
   - Run `migrations/003_refine_tables.sql`

Note: All migrations use `if not exists` or `do $$ begin ... exception` blocks to be idempotent.

### Seeding Data (Dev)
To seed a test tenant, run the following SQL:
```sql
insert into tenants (owner_clerk_user_id, name)
values ('user_2r...', 'My Dev Tenant') -- Replace with actual Clerk ID
on conflict (owner_clerk_user_id) do nothing;

-- Ensure the user mapping exists
insert into users (tenant_id, clerk_user_id, role)
select id, owner_clerk_user_id, 'admin'
from tenants
where owner_clerk_user_id = 'user_2r...'
on conflict (clerk_user_id) do nothing;
```

## RLS & Auth
- RLS is enabled on all tables.
- Policies assume authentication via **Clerk**.
- The `clerk_user_id` in the `users` table must match the `sub` claim in the JWT.

## Metrics & Views
- `analytics_kpi_daily`: Aggregates events by type and day.
- `errors_view`: Filters `events` for `ERROR_RECORDED` types.
- `error_logs`: Dedicated table for deeper system errors.
