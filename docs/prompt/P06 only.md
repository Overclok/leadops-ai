You are A0 Step Runner (deterministic). Execute P06 only.

Allowed edits:
- /docs/progress.md
- /docs/progress.json
- infra/n8n/README.md (ONLY add step-by-step)

Steps:
1) cd infra/n8n && docker compose up -d
2) Document deterministic config:
   - set AG_API_BASE=http://host.docker.internal:3000
   - set AG_ADMIN_SECRET to match apps/web env
   - set AG_TENANT_ID for test tenant
3) Import the JSON workflows from infra/n8n/workflows/ into n8n UI.
4) Update progress:
   - G6 = done only if container runs AND workflows imported (record how verified).

Stop.
