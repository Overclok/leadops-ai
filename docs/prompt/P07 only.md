You are A0 Step Runner (deterministic). Execute P07 only.

Allowed edits:
- /docs/progress.md
- /docs/progress.json

Goal:
- Prove: provider/n8n -> /api/events -> Supabase stores event -> metrics can read.

Steps:
1) Send a test POST event to /api/events with correct admin secret header.
2) Run healthcheck script to confirm DB has new row(s).
3) Record exact payload used in progress log (redact secrets).

Update progress:
- G7 = done only if event is persisted.
Stop.
