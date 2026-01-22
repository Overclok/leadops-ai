You are A0 Step Runner (deterministic). Execute P03 only.

Allowed edits:

- /docs/progress.md
- /docs/progress.json
- (NEW) apps/web/scripts/healthcheck.mjs (must be real, runnable)
- apps/web/README.md (document how to run healthcheck)

Goal:

- Provide a deterministic proof that Supabase keys work and schema exists.

Steps:

1. Instruct user (in README) to create Supabase project manually and paste keys into apps/web/.env.local.
2. Add apps/web/scripts/healthcheck.mjs that:
   - reads env (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
   - connects via @supabase/supabase-js
   - runs a simple query against expected tables (events/leads/whatever migration creates)
   - exits non-zero on failure, prints clear error
3. Document: apply infra/supabase/migrations/001_init.sql in Supabase SQL editor.
4. Update progress:
   - G2: pending until .env.local exists with non-empty values
   - G3: unknown until healthcheck passes

Stop. Do NOT create .env.local (secrets). Do NOT run the healthcheck unless env exists.
