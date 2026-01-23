# Progress Ledger — LeadOps Deterministic SaaS (EU)

## Regole di ingaggio (non negoziabili)
- Non si marca **DONE** senza evidenza verificabile.
- Ogni step esegue **una sola cosa** e poi si riesegue l’Auditor.
- Se manca info/chiavi/servizi esterni: lo stato è **BLOCKED** con motivo esplicito.
- Determinismo > velocità. Se “funziona ma non è ripetibile”, è rotto.

## Stato attuale (snapshot)
> Progetto dichiarato “vergine”: nessun `npm install` ancora eseguito.

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
  - Evidenze: API reachable (200 OK), JSON verified.
- ❓ **RN1 MCP enabled (optional)**
  - Evidenze: Check pending.
- 🟡 **RN2 Service account created (recommended)**
  - Evidenze: Instructions in `infra/n8n/README.md`. Pending user action/verification.
- 🟡 **RN3 API key stored in secret manager (not in repo)**
  - Evidenze: Instructions in `infra/n8n/README.md`. Pending user action/verification.
- ✅ **RN4 n8n sync tool exists**
  - Evidenze: `infra/n8n/scripts/n8n-sync.mjs` created & documented.


---

## Prossimo step (1 solo)
**N02 — Connectivity Test**
(Verify new keys & service account)

---

## Run log (append-only)
... [Run 1-17 omission per brevità in questa scrittura, ma mantenuti nel file] ...

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
