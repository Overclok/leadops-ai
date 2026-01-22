
# apps/web

Next.js App Router + Clerk + Supabase (server-side).

## Determinism note
Per un determinismo completo va generato e committato un lockfile.

**Strict Workflow:**
1. **First-time setup only**: `npm install` (generates `package-lock.json`).
2. **After lock exists**: ALWAYS use `npm ci`.
3. **WARNING**: Do not use `npm install` once lock is committed unless intentionally changing deps.

## Clerk Setup (1-User-Per-Tenant Model)

**Authentication Model**: This app implements a **strict 1-user-per-tenant architecture**.
- Each Clerk user maps to exactly **one tenant** in the database.
- On first login, a tenant is auto-created with `owner_clerk_user_id = userId`.
- All protected routes (`/dashboard`, `/api/tenant`, `/api/metrics`) require authentication.
- Cross-tenant access is prevented by runtime assertions in `src/lib/tenant.ts`.

### Setup Steps:

1. **Create Clerk Application**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/).
   - Create a new application (choose "Email + Password" or your preferred auth method).
   - Note: We do NOT use Clerk Organizations (enforcing single-user tenancy instead).

2. **Configure Environment Variables**:
   Add the following to `apps/web/.env.local` (do NOT commit):
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Frontend public key (safe to expose).
   - `CLERK_SECRET_KEY`: Backend secret key (must remain server-side only).

3. **Verify Authentication**:
   - Run `npm run dev` and navigate to `http://localhost:3001`.
   - Click "Sign In" and create a test user.
   - On first login, a tenant will be auto-created in the `tenants` table.
   - Visit `/dashboard` to confirm auth is working.

### Tenant Resolution Logic:
- **Source**: `src/lib/tenant.ts` → `getOrCreateTenant()`
- **Behavior**:
  1. Extracts `userId` from Clerk session via `auth()`.
  2. Queries `tenants` table for matching `owner_clerk_user_id`.
  3. If not found, auto-creates tenant with deterministic defaults.
  4. Returns `{ id, owner_clerk_user_id, name, webhook_secret, created_at }`.

**Fail-closed guarantee**: All protected routes throw if user is not authenticated.

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

    If successful, it will verify access to the `tenants` table.

## Deployment to Vercel (Monorepo & Next.js 16)

To deploy this application to Vercel, you must configure the following project settings:

1. **Root Directory**: Set this to `apps/web`. Vercel will then auto-detect Next.js.
2. **Environment Variables**: You must manually add all variables from your `apps/web/.env.local` to the Vercel Dashboard (Settings > Environment Variables). Required keys include:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AG_ADMIN_SECRET`
3. **Node.js Version**: In Project Settings > General, ensure the Node.js version is set to **24.x** (compatible with our `.nvmrc`).
4. **Proxy (Middleware)**: This project uses the Next.js 16 `proxy.ts` convention (located in `src/proxy.ts`). Ensure you have updated the code to use the **named export** `proxy` for production compatibility.

**Warning**: If you see a Vercel 404 error, double-check that the **Root Directory** is explicitly set to `apps/web`.
