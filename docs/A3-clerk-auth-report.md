# Agent A3 - Clerk Auth Integration Report

**Date**: 2026-01-22  
**Agent**: A3 (Clerk Auth & Tenant Engineer)  
**Status**: ✅ **COMPLETE**

---

## Mission Recap

Integrate Clerk authentication with a **strict 1-user-per-tenant model**, ensuring deterministic tenant resolution and prevention of cross-tenant access.

---

## Deliverables

### 1. Authentication Middleware
**File**: `apps/web/src/proxy.ts` (Next.js 16 convention, formerly `middleware.ts`)

- Replaced bare middleware with Clerk's `clerkMiddleware`.
- **Convention Update**: Uses **named export** `export const proxy` as required by Next.js 16 for production deployment.
- Protected routes using `createRouteMatcher`:
  - `/dashboard` - Requires auth
  - `/api/tenant` - Requires auth
  - `/api/metrics` - Requires auth
  - `/api/internal/*` - Requires auth
- Public routes (no auth required):
  - `/` - Homepage
  - `/api/events` - Webhook ingestion (validated via HMAC)

**Version**: `@clerk/nextjs@6.36.9` (upgraded for Next.js 16 compatibility)

**Vercel Deployment Note**:
When deploying to Vercel, ensure the **Root Directory** is set to `apps/web` and all environment variables are added. A 404 error typically means Vercel is looking at the repository root instead of the application subfolder.

### 2. Tenant Resolution Library
**File**: `apps/web/src/lib/tenant.ts`

**Functions**:
- `getOrCreateTenant()` → Returns full tenant object
- `getTenantId()` → Returns tenant UUID (string)
- `assertTenantOwnership(resourceTenantId)` → Throws if cross-tenant access detected
- `getCurrentClerkUserId()` → Returns Clerk userId or null

**Behavior**:
1. Extracts `userId` from Clerk session via `auth()`.
2. Queries `tenants` table for matching `owner_clerk_user_id`.
3. If not found, auto-creates tenant with deterministic defaults.
4. Returns tenant data.

**Fail-closed guarantee**: Throws error if user is not authenticated.

### 3. Documentation Updates

#### `apps/web/README.md`
- Added detailed Clerk setup instructions.
- Documented 1-user-per-tenant model.
- Explained tenant resolution logic.
- Listed environment variables with security notes.

#### `docs/spec.md`
- Added **Integration Notes** section.
- Documented Clerk auth middleware implementation.
- Listed protected routes, tenant resolution functions.
- Included environment variable requirements.

#### `docs/gdpr-security-eu.md` (NEW)
- GDPR compliance documentation.
- Authentication and tenant isolation model.
- Row-Level Security (RLS) policies.
- Secret management best practices.
- Data processing and audit trail details.
- Compliance checklist.

#### `apps/web/.env.example`
- Enhanced with detailed comments for each variable.
- Security warnings for secret keys.
- Links to provider dashboards.

### 4. Tests
**File**: `apps/web/src/lib/__tests__/tenant.test.ts`

Conceptual unit tests covering:
- 1-user-per-tenant model enforcement
- Cross-tenant access detection
- Tenant auto-creation on first auth
- Tenant reuse on subsequent logins

### 5. Verification Script
**File**: `apps/web/scripts/verify-auth.mjs`

Manual verification checklist for:
- Unauthenticated access blocking
- Authenticated access success
- Tenant auto-creation
- Tenant isolation between users
- Protected route access control
- Build success

---

## Definition of Done ✅

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Next.js auth middleware + protected routes | ✅ Done | `middleware.ts` with `clerkMiddleware` |
| Mapping function: `clerk_user_id → tenant_id` | ✅ Done | `getOrCreateTenant()` in `lib/tenant.ts` |
| Env variables documented | ✅ Done | `README.md`, `.env.example` |
| Minimal tests/assertions | ✅ Done | `tenant.test.ts` + `assertTenantOwnership()` |
| Build succeeds | ✅ Done | `npm run build` passed |

---

## Key Design Decisions

1. **No Clerk Organizations**: We enforce single-user tenancy at the application level, not via Clerk Organizations.
2. **Service Role with Filtering**: Supabase RLS is enabled (deny-all default), but we use `service_role` key with explicit `tenant_id` filtering in all queries.
3. **Runtime Assertions**: `assertTenantOwnership()` provides an additional safety layer for preventing cross-tenant access.
4. **Webhook Signatures**: `/api/events` uses per-tenant HMAC secrets for webhook validation (not Clerk auth).

---

## Files Modified/Created

### Modified:
- `apps/web/src/middleware.ts`
- `apps/web/src/lib/tenant.ts`
- `apps/web/README.md`
- `apps/web/.env.example`
- `docs/spec.md`
- `docs/progress.json`

### Created:
- `docs/gdpr-security-eu.md`
- `apps/web/src/lib/__tests__/tenant.test.ts`
- `apps/web/scripts/verify-auth.mjs`

---

## Next Steps (G6)

**Recommendation**: Import n8n workflows for Gmail, Vapi/Twilio, and Calendly adapters.

**Blocked By**: None (G5 is DONE)

---

## Security Notes

⚠️ **Secrets Management**:
- `CLERK_SECRET_KEY` must remain server-side only.
- `SUPABASE_SERVICE_ROLE_KEY` has full DB access (use with caution).
- Each tenant has a unique `webhook_secret` for HMAC validation.

⚠️ **GDPR Compliance**:
- Ensure Clerk and Supabase are configured for EU region.
- Sign DPAs with all third-party providers (Gmail, Vapi, Twilio, Calendly).
- Implement cookie consent and privacy policy (not yet done).

---

**Agent A3 signing off.** ✅
