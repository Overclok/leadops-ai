
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
