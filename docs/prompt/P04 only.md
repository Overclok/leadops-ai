You are A0 Step Runner (deterministic). Execute P04 only.

Allowed edits:
- /docs/progress.md
- /docs/progress.json
- apps/web/README.md (setup steps for Clerk)
- apps/web/src/app/dashboard/page.tsx (ONLY if you need to enforce auth gate)
- apps/web/src/middleware.ts (ONLY if missing or incorrect)

Goal:
- Deterministically verify that 1 user per tenant login works and protected routes require auth.

Steps:
1) Ensure middleware uses Clerk (already present). Verify routes protected:
   - /dashboard must require auth
2) Update README with:
   - Clerk keys needed in .env.local (publishable + secret)
3) Update progress:
   - G5 = pending until you can confirm login redirect behavior (manual check ok)

Stop.
