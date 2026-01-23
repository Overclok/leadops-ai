
# n8n (self-hosted)

Avvia:
- `docker compose up -d`

Poi:
- importa i workflow JSON in `workflows/`
  - includi anche `derive_no_reply.json` se vuoi generare automaticamente l'evento derivato `EMAIL_NO_REPLY` (regola: 5 giorni senza risposta)
- imposta env:
  - AG_API_BASE (es. http://host.docker.internal:3000)
  - AG_TENANT_ID
  - AG_WEBHOOK_SECRET
  - AG_ADMIN_SECRET (per chiamare le route internal di derivazione)

Nota: la firma HMAC (`x-ag-signature`) va calcolata in n8n con un Function node prima dell’HTTP Request.
In questo pack il workflow include già il nodo **SignRequest** (HMAC deterministica) e popola automaticamente `x-ag-ts` e `x-ag-signature`.

## Security & Provisioning

### 1. Dedicated Service Account
We recommend creating a specific user for automation to keep logs distinct.
1.  Log in to n8n as owner.
2.  Go to **Settings** > **Users**.
3.  Invite a new user (e.g., `audit@leadops.ai`) or create a service user.
4.  Log in as this new user to generate keys.

### 2. API Key Generation
1.  Go to **Settings** > **Personal API Key**.
2.  Click **Create API Key**.
3.  Label it `LeadOps_Automation`.
4.  Copy the key immediately (it is shown only once).

### 3. Secret Management
**CRITICAL**: Do NOT store the API Key in this repository (no `.env` files committed).
1.  Store the key in **Antigravity/Easypanel** (Project Secrets) as `N8N_API_KEY`.
2.  Also set `N8N_BASE_URL` (e.g., `https://n8n.leadops.dev` or `http://localhost:5678`).
3.  For local scripts (n8n-sync), use `infra/n8n/.env.local` (git-ignored).

## Deterministic provisioning via n8n-sync

Use the `n8n-sync.mjs` script to idempotently sync local JSON workflows to a remote n8n instance.

**Prerequisites:**
1.  Enable n8n API in Settings.
2.  Complete steps 1-3 above (User, Key, Secrets).
3.  Store credentials in `.env.local` or a secret manager (NOT in git):
    ```bash
    N8N_BASE_URL=https://your-n8n-instance.com
    N8N_API_KEY=your-api-key-here
    ```

**Usage:**

1.  **DRY RUN** (Prints plan only):
    ```bash
    node infra/n8n/scripts/n8n-sync.mjs
    ```

2.  **APPLY** (Executes changes):
    ```bash
    APPLY=true node infra/n8n/scripts/n8n-sync.mjs
    ```

**Safety Rules:**
-   Never commit `.env` files containing `N8N_API_KEY`.
-   The script will refuse to run if `APPLY=true` is not set explicitly for writes.
-   Workflow identity is based on the "name" field in the JSON.


## Verification Checklist
Where to check in n8n UI (Manually):

- [ ] **Settings -> n8n API**: Is it enabled?
- [ ] **Settings -> Instance-level MCP**: Is it enabled? (Optional)
- [ ] **About / Version**: Capture Version + edition screen evidence.
