
# apps/web

Next.js App Router + Clerk + Supabase (server-side).

## Determinism note
Per un determinismo completo va generato e committato un lockfile.

**Strict Workflow:**
1. **First-time setup only**: `npm install` (generates `package-lock.json`).
2. **After lock exists**: ALWAYS use `npm ci`.
3. **WARNING**: Do not use `npm install` once lock is committed unless intentionally changing deps.
