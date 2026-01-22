
# Event contracts

Schema canonico: `.agent/skills/metrics-engine/references/event-schema.json`

Firma richiesta (HMAC):
- `x-ag-ts`: epoch ms
- `x-ag-signature`: hex(HMAC_SHA256(secret, ts + "." + stableStringify(event)))

`stableStringify` = JSON canonico con chiavi oggetto ordinate lessicograficamente (vedi `apps/web/src/lib/stableJson.ts`).

Idempotenza:
- unique `(tenant_id, idempotency_key)`
