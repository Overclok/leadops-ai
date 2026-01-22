
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

## Remote Config Checklist
- [ ] Settings -> n8n API (enabled?)
- [ ] Settings -> Instance-level MCP (enabled?)
- [ ] Version + edition (screenshot/log evidence)

## Deterministic provisioning via n8n-sync

Use the `n8n-sync.mjs` script to idempotently sync local JSON workflows to a remote n8n instance.

**Prerequisites:**
1.  Enable n8n API in Settings.
2.  Generate an API Key.
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

