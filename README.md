
# LeadOps AI — Deterministic Antigravity Workspace

Workspace deterministico (event-sourced) per un’AI agency che vende sistemi di:
- automazione email (outbound + reply detection Gmail)
- automazione chiamate (Twilio + Vapi)
- booking (Calendly)
con dashboard KPI per cliente (1 utente per tenant via Clerk).

## Componenti
- **.agent/**: regole, workflow e skills (formato Antigravity)
- **docs/**: spec e contratti (eventi, metriche, errori, dashboard)
- **infra/**: Supabase (migrazioni) + n8n self-hosted (docker + workflow adapter)
- **apps/web/**: Next.js (App Router) + Clerk + API ingestion + dashboard

## Cosa manca per eseguire end-to-end
Servono asset esterni e configurazioni che non posso inventare:

1) **Clerk**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - Redirect URL: `http://localhost:3000` (dev) + dominio prod

2) **Supabase**
   - Progetto Supabase creato
   - Eseguire `infra/supabase/migrations/001_init.sql`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

3) **n8n + provider**
   - Avviare `infra/n8n/docker-compose.yml`
   - Importare i workflow in `infra/n8n/workflows/*`
   - Configurare credenziali:
     - Gmail API + Pub/Sub watch (consigliato) o polling
     - Vapi server-url webhook
     - Calendly webhook subscription
   - Impostare `AG_API_BASE`, `AG_TENANT_ID`, `AG_WEBHOOK_SECRET`, `AG_ADMIN_SECRET`
   - (Opzionale ma consigliato) importare e attivare `derive_no_reply.json` per generare `EMAIL_NO_REPLY`

4) **Lockfile per determinismo completo**
   - In `apps/web` è incluso `package.json` pin-nato, ma il lockfile va generato in Antigravity con `npm install` e poi committato.

Vedi `docs/spec.md` per istruzioni.
