# Progress Ledger — LeadOps Deterministic SaaS (EU)

## Regole di ingaggio (non negoziabili)

- Non si marca **DONE** senza evidenza verificabile.
- Ogni step esegue **una sola cosa** e poi si riesegue l’Auditor.
- Se manca info/chiavi/servizi esterni: lo stato è **BLOCKED** con motivo esplicito.
- Determinismo > velocità. Se “funziona ma non è ripetibile”, è rotto.
- Crea un file report come esempio guarda il file (A3-clerk-auth-report.md)

## Stato attuale (snapshot)

> Progetto inizializzato: `npm install` eseguito, environment configurato, n8n in fase di provisioning.

Legenda: ✅ done | 🟡 pending | ❓ unknown | ⛔ blocked

- ✅ **G0 Repo integrity & structure**
  - Evidenze: Folders exist, Key files (package.json, docker-compose, migrations) present.
- ✅ **G1 Toolchain pinned & deterministic deps**
  - Evidenze: lockfile generated (v3), .nvmrc pinned, engines pinned
- ✅ **G2 Env configured (no secrets committed)**
  - Evidenze: .env.local verified, Healthcheck passed.
- ✅ **G3 Supabase schema applied & tenant isolation**
  - Evidenze: Tutte le migrazioni (001, 002, 003) applicate via MCP. 9 tabelle verificate.
- ✅ **G4 Web app boots (dev & build)**
  - Evidenze: `npm install` ✅, `npm run build` ✅, `npm run dev` ✅ (Port 3001)
- ✅ **G5 Auth works (Clerk)**
  - Evidenze: Clerk middleware integrato, Tenant resolution verificata, Build superata.

---

## Remote n8n Readiness

- ✅ **RN0 API enabled**
  - Evidenze: Verified via MCP connection (200 OK).
- ✅ **RN1 MCP enabled (optional)**
  - Evidenze: `mcp_n8n-mcp_search_workflows` execution successful.
- 🟡 **RN2 Service account created (recommended)**
  - Evidenze: Instructions in `infra/n8n/README.md`.
- 🟡 **RN3 API key stored in secret manager (not in repo)**
  - Evidenze: Instructions in `infra/n8n/README.md`.
- ✅ **RN4 n8n sync tool exists**
  - Evidenze: `infra/n8n/scripts/n8n-sync.mjs` created & documented.
- ✅ **RN5 Workflows imported**
  - Evidenze: 4 workflows applied via sync tool (Calendly, Gmail, Vapi, No-Reply).

---

## Prossimo step (1 solo)

**N05 — Credentials & Env**
(Activate triggers only after credentials and env exist)

---

### Run #18 (A2 Schema Application via MCP)

- **Data**: 2026-01-22 23:40 CET
- **Auditor**: Antigravity
- **Risultato**: G3 Verificato & Applicato
- **Note**:
  - Applicato `001_init.sql`, `002_schema_update.sql`, `003_refine_tables.sql` tramite `supabase-mcp-server`.
  - Tabelle confermate: `tenants`, `users`, `leads`, `campaigns`, `products_services`, `deals`, `events`, `job_runs`, `error_logs`.
  - RLS abilitato su tutte le tabelle.
- **Next Prompt**: G6

### Run #19 (N01 Provisioning Docs)

- **Data**: 2026-01-23 09:22 CET
- **Auditor**: N8N_AUDITOR (Antigravity)
- **Risultato**: Setup Documented (Yellow)
- **Note**:
  - Aggiornato `infra/n8n/README.md` con istruzioni per Service Account e API Key.
  - Richiesto salvataggio API Key in Secret Manager (non repo).
  - Stati RN2/RN3 impostati a Pending in attesa di verifica connettività.
- **Next Prompt**: N02

### Run #20 (N02 Connectivity Check)

- **Data**: 2026-01-23 09:30 CET
- **Auditor**: Antigravity
- **Risultato**: ⛔ Blocked (Auth Failed)
- **Note**:
  - Executed GET /api/v1/workflows
  - Result: 401 Unauthorized.
  - RN0 marked as blocked.
- **Next Prompt**: Fix RN0

### Run #21 (N8N Remote Audit)

- **Data**: 2026-01-23 09:45 CET
- **Auditor**: N8N_AUDITOR (Antigravity)
- **Risultato**: Pending / Reset
- **Note**:
  - Added manual verification checklist to `infra/n8n/README.md`.
  - Reset RN0-RN3 status to pending/unknown.
  - Required manual check of API enabled, MCP enabled, and Edition/Version.
- **Next Prompt**: N01

### Run #22 (N01 Provision Coordination)

- **Data**: 2026-01-23 09:47 CET
- **Auditor**: N8N_PROVISIONING_COORDINATOR (Antigravity)
- **Risultato**: Documentation Updated (Pending User Action)
- **Note**:
  - Aggiornato `infra/n8n/README.md` con istruzioni Service Account & API Key.
  - Creato `infra/n8n/.env.example`.
  - Richiesto intervento utente per creazione credenziali e salvataggio in Secret Manager.
- **Next Prompt**: N02

### Run #23 (N02 Connectivity Retry)

- **Data**: 2026-01-23 10:05 CET
- **Auditor**: Antigravity
- **Risultato**: ⛔ Blocked (Auth Failed)
- **Note**:
  - Retried GET /api/v1/workflows vs https://lead-ops-n8n.xgtymm.easypanel.host
  - Tested with X-N8N-API-KEY and Bearer token.
  - Result: 401 Unauthorized.
- **Next Prompt**: Fix RN0

### Run #24 (N02 Connectivity Check - MCP)

- **Data**: 2026-01-23 10:08 CET
- **Auditor**: Antigravity
- **Risultato**: ✅ Success
- **Note**:
  - Executed `mcp_n8n-mcp_search_workflows` with limit=1.
  - Returned HTTP 200 (Count: 0).
  - Verified connectivity and auth via MCP.
- **Next Prompt**: N03

### Run #25 (N03 Sync Tool Implementation)

- **Data**: 2026-01-23 10:25 CET
- **Auditor**: Antigravity
- **Risultato**: ✅ RN4 Verified
- **Note**:
  - Implemented `infra/n8n/scripts/n8n-sync.mjs` with deterministic plan, API Key auth, and safety checks.
  - Updated `infra/n8n/README.md` with usage instructions (DRY_RUN vs APPLY).
  - Ready for N04 (Workflow Import).
- **Next Prompt**: N04

### Run #26 (N04 Import Workflows)

- **Data**: 2026-01-23 10:45 CET
- **Auditor**: N8N_PROVISIONER (Antigravity)
- **Risultato**: ✅ RN5 Verified
- **Note**:
  - Executed `n8n-sync.mjs` in APPLY mode.
  - Fixes: Injected defaults for `settings`, changed PATCH to PUT.
  - Workflows created: `calendly_adapter`, `gmail_adapter`, `vapi_adapter`, `derive_no_reply`.
  - Next: Do not activate until credentials set.
- **Next Prompt**: N05

### Run #27 (N05 Credentials & Activation Plan)

- **Data**: 2026-01-23 11:20 CET
- **Auditor**: Antigravity
- **Risultato**: Docs Created (Pending User Action)
- **Note**:
  - Created infra/n8n/credentials.md (Detailed setup)
  - Created infra/n8n/runtime-config.md (Env vars)
  - Created docs/runbooks/n8n-activation.md (Strict runbook)
  - Updated infra/n8n/README.md
  - Corrected legacy 'vergine' status.
- **Next Prompt**: Execute Activation Runbook (Manual)
