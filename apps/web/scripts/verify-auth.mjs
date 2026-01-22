#!/usr/bin/env node
/**
 * Manual Verification Script for Clerk Auth Integration
 * 
 * This script provides a checklist for manually verifying that:
 * 1. Clerk middleware is protecting routes correctly
 * 2. Tenant resolution works deterministically
 * 3. Cross-tenant access is prevented
 * 
 * Run this AFTER deploying or running `npm run dev`.
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Clerk Auth Integration - Manual Verification Checklist       ║
╚════════════════════════════════════════════════════════════════╝

Prerequisites:
✓ Clerk app created (https://dashboard.clerk.com)
✓ CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local
✓ Supabase schema applied (infra/supabase/migrations/001_init.sql)
✓ App running on http://localhost:3001 (npm run dev)

═══════════════════════════════════════════════════════════════
STEP 1: Verify Unauthenticated Access
═══════════════════════════════════════════════════════════════

1.1. Open browser (incognito mode)
1.2. Visit: http://localhost:3001
     ✓ Homepage should load
     ✓ "Sign In" button visible
     
1.3. Visit: http://localhost:3001/dashboard
     ✓ Should redirect to Clerk sign-in page
     ✓ OR show "You need to authenticate" message

═══════════════════════════════════════════════════════════════
STEP 2: Verify Authenticated Access
═══════════════════════════════════════════════════════════════

2.1. Click "Sign In" and create a test user (or log in)
2.2. After login, verify redirect to homepage
2.3. Visit: http://localhost:3001/dashboard
     ✓ Dashboard should load successfully
     ✓ No 500 errors
     ✓ No auth errors in console

═══════════════════════════════════════════════════════════════
STEP 3: Verify Tenant Auto-Creation
═══════════════════════════════════════════════════════════════

3.1. Open Supabase Dashboard > Table Editor > tenants
3.2. Find row where owner_clerk_user_id matches your Clerk user ID
     ✓ Tenant should exist
     ✓ webhook_secret should be populated (32-byte hex string)
     
3.3. Call API: http://localhost:3001/api/tenant
     ✓ Should return JSON with: { id, name, webhook_secret }
     ✓ id should match the tenant in Supabase

═══════════════════════════════════════════════════════════════
STEP 4: Verify Tenant Isolation
═══════════════════════════════════════════════════════════════

4.1. Log in as User A and note tenant_id from /api/tenant
4.2. Log out and create User B
4.3. Note tenant_id for User B
     ✓ User A tenant_id ≠ User B tenant_id
     
4.4. Try to access /api/metrics as User B
     ✓ Should only see User B's events (not User A's)

═══════════════════════════════════════════════════════════════
STEP 5: Verify Protected Routes
═══════════════════════════════════════════════════════════════

5.1. While logged IN, visit:
     - /api/tenant → Should return 200 JSON
     - /api/metrics → Should return 200 JSON
     - /dashboard → Should render page
     
5.2. Log OUT and visit same routes:
     - /api/tenant → Should redirect to sign-in
     - /api/metrics → Should redirect to sign-in
     - /dashboard → Should redirect to sign-in

═══════════════════════════════════════════════════════════════
STEP 6: Verify Build
═══════════════════════════════════════════════════════════════

6.1. Run: npm run build
     ✓ Build should succeed without TypeScript errors
     ✓ No Clerk-related errors

═══════════════════════════════════════════════════════════════
✅ ALL CHECKS PASSED
═══════════════════════════════════════════════════════════════

If all steps above passed, G5 is DONE.

Next Steps:
→ G6: Import n8n workflows (Gmail, Vapi/Twilio, Calendly)
→ G7: Test end-to-end event ingestion
→ G8: Verify deterministic metrics calculation

`);
