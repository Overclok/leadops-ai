# Supabase Infrastructure

This directory contains the Supabase configuration and migration files for LeadOps AI.

## Migrations

The database schema is managed via SQL migrations in the `migrations/` folder.

- `001_init.sql`: Initial schema setup (Tables, Enums, Basic RLS Setup).
- `002_schema_update.sql`: RLS Policies implementation, `job_runs` table, Indexes, and Views.

## Applying Migrations

### Local / Development
1. Ensure you have the Supabase CLI installed or use the SQL Editor in the Supabase Dashboard.
2. Apply the files in order:
   - Copy contents of `migrations/001_init.sql` and run it in the SQL Editor.
   - Copy contents of `migrations/002_schema_update.sql` and run it in the SQL Editor.

### Seeding Data (Dev)
To seed a test tenant, run the following SQL:
```sql
insert into tenants (owner_clerk_user_id, name)
values ('user_2r...', 'My Dev Tenant') -- Replace with your actual Clerk User ID from the Clerk Dashboard
on conflict (owner_clerk_user_id) do nothing;
```

## RLS & Auth
- RLS is enabled on all tables.
- Policies assume authentication via **Clerk**.
- The `owner_clerk_user_id` in the `tenants` table must match the `sub` claim in the JWT.

## Metrics & Views
- `analytics_kpi_daily`: Aggregates events by type and day for dashboards.
- `errors_view`: Filters `events` for `ERROR_RECORDED` logic.
