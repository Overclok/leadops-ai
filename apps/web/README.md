
# apps/web

Next.js App Router + Clerk + Supabase (server-side).

## Determinism note
Per un determinismo completo va generato e committato un lockfile.

**Strict Workflow:**
1. **First-time setup only**: `npm install` (generates `package-lock.json`).
2. **After lock exists**: ALWAYS use `npm ci`.
3. **WARNING**: Do not use `npm install` once lock is committed unless intentionally changing deps.

## Clerk Setup
1. **Create Clerk Application**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/).
   - Create application.

2. **Configure Environment**:
   - Add to `apps/web/.env.local` (do NOT commit):
     ```bash
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```


## Supabase Setup (Manual & Deterministic)
Since we are using existing infrastructure or manual provisioning for now (no local Docker Supabase yet):

1. **Create Supabase Project**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
   - Region: EU (Frankfurt) preferred.

2. **Configure Environment**:
   - Create `apps/web/.env.local` (do NOT commit this file).
   - Add the following keys from Supabase Settings -> API:
     ```bash
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Apply Schema**:
   - Open `infra/supabase/migrations/001_init.sql`.
   - Copy the content.
   - Go to Supabase Dashboard -> SQL Editor -> New Query.
   - Paste and Run.

4. **Verify Health**:
   Run the deterministic healthcheck script to prove connectivity and schema existence:
   ```bash
   node --env-file=.env.local scripts/healthcheck.mjs
   ```
   If successful, it will verify access to the `tenants` table.
