
# Spec — LeadOps AI (Italia/EU)

## Scope
- lead gen: cold email + inbound
- Gmail reply detection
- Calendly booking
- Twilio + Vapi calls
- 1 utente per tenant via Clerk

## Architettura
Provider → n8n (adapter) → `/api/events` (Next) → Supabase (event store) → API metrics → dashboard.

## Local run (dev)
1) Supabase: crea progetto, esegui `infra/supabase/migrations/001_init.sql`
2) Clerk: crea app, configura env in `apps/web/.env.example`
3) Web: `cd apps/web && npm install && npm run dev`
4) n8n: `cd infra/n8n && docker compose up -d`
5) Import workflow JSON in n8n e set env: `AG_API_BASE`, `AG_TENANT_ID`, `AG_WEBHOOK_SECRET`.
