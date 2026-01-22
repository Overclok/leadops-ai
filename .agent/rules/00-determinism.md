
# 00 — Determinism (hard rules)

## Non negoziabili
1) Nessun file vuoto o placeholder.
2) Contratti prima del codice:
   - enum + schema eventi + metriche + migrazioni DB.
3) Event sourcing:
   - eventi append-only; gli “stati” derivano da eventi.
4) Idempotenza:
   - unique `(tenant_id, idempotency_key)` nel DB.
5) Ingestion sicura:
   - HMAC SHA-256 con timestamp window.
6) EU/GDPR:
   - minimizzazione PII, retention configurabile.
7) Version pinning:
   - niente `:latest` in Docker.
   - dipendenze JS con versioni fissate.
