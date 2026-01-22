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
- 🟡 **G2 Env configured (no secrets committed)**
  - Evidenze: .env.local found, keys detected.
- 🟡 **G3 Supabase schema applied & tenant isolation**
  - Evidenze: migrazione esistente (filesystem), stato db ignoto
- ⛔ **G4 Web app boots (dev & build)**
  - Evidenze: `npm install` ✅, `npm run build` ❌ Module not found (@/lib/...)
- 🟡 **G5 Auth works (Clerk)**
  - Evidenze: redirect/login + tenant mapping
- 🟡 **G6 n8n self-hosted runs + workflows imported**
  - Evidenze: docker compose up + workflow import
- 🟡 **G7 End-to-end ingestion**
  - Evidenze: POST evento -> DB persist -> dedupe OK
- 🟡 **G8 Metrics deterministic**
  - Evidenze: output stabile su 2 run
- 🟡 **G9 Dashboard renders KPI + drilldowns**
  - Evidenze: KPI + timeline + campagne + prodotti caldi + stati UI

---

## Remote n8n Readiness
- ✅ **RN0 API enabled**
  - Evidenze: API reachable (200 OK), JSON verified.
- ❓ **RN1 MCP enabled (optional)**
  - Evidenze: Check pending.
- ❓ **RN2 Service account created (recommended)**
  - Evidenze: Check pending.
- ❓ **RN3 API key stored in secret manager (not in repo)**
  - Evidenze: Check pending.
- ✅ **RN4 n8n sync tool exists**
  - Evidenze: `infra/n8n/scripts/n8n-sync.mjs` created & documented.


---

## Prossimo step (1 solo)
**N04 — Execute n8n Sync**
(Run DRY_RUN then APPLY, verify imported workflows)

---

## Run log (append-only)
### Run #1 (P00 Audit)
- **Data**: 2026-01-22 13:43 CET
- **Auditor**: Antigravity
- **Risultato**: G0 (Done), G1/G2 (Pending/Missing files)
- **Note**: Repo detected as fresh. Missing lockfile and environment config.
- **Next Prompt**: P01

### Run #2 (P00 Re-Check)
- **Data**: 2026-01-22 13:47 CET
- **Auditor**: Antigravity
- **Risultato**: Status Unchanged (G0 Done, others Pending)
- **Note**: Re-verified state. Still waiting for toolchain pin (P01).
- **Next Prompt**: P01

### Run #3 (P00 Execution)
- **Data**: 2026-01-22 17:39 CET
- **Auditor**: Antigravity
- **Risultato**: G1 Pending, G2 Progress (Evidence found)
- **Note**: .env.local exists with keys. .gitignore missing in root/apps/web. Toolchain still unpinned.
- **Next Prompt**: P01

### Run #4 (P01 Execution)
- **Data**: 2026-01-22 17:52 CET
- **Auditor**: Antigravity
- **Risultato**: G1 Pending (toolchain pinned, lockfile missing)
- **Note**: Created .nvmrc, updated package.json engines, updated README.
- **Next Prompt**: P02

### Run #5 (P02 Execution)
- **Data**: 2026-01-22 18:10 CET
- **Auditor**: Antigravity
- **Risultato**: G1 Done, G4 Blocked
- **Note**: `npm install` generated package-lock.json. `npm run build` failed due to missing `@/*` paths in `tsconfig.json`.
- **Next Prompt**: P03

### Run #6 (Remote Audit Prep)
- **Data**: 2026-01-22 18:43 CET
- **Auditor**: Antigravity
- **Risultato**: Added Remote n8n Readiness Gates RN0-RN3
- **Note**: Defined remote readiness gates in progress ledger.
- **Next Prompt**: N01

### Run #7 (N02 Execution)
- **Data**: 2026-01-22 19:07 CET
- **Auditor**: Antigravity
- **Risultato**: RN0 Blocked
- **Note**: Attempted to verify n8n API. Blocked by missing `N8N_BASE_URL` and `N8N_API_KEY` in environment, and `lcalhost:5678` unreachable (likely remote context required).
- **Next Prompt**: N03

### Run #8 (N02 Retry)
- **Data**: 2026-01-22 19:12 CET
- **Auditor**: Antigravity
- **Risultato**: RN0 Done
- **Note**: Verified connection to remote n8n instance. 200 OK.
- **Next Prompt**: N03

### Run #9 (N03 Execution)
- **Data**: 2026-01-22 19:21 CET
- **Auditor**: Antigravity
- **Risultato**: RN4 Done
- **Note**: Created `n8n-sync.mjs` for idempotent workflow provisioning.
- **Next Prompt**: N04
