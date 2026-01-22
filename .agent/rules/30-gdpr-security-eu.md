
# 30 — GDPR + Security (EU)

## Minimizzazione
- Email: non salvare body completo di default, solo metadata.
- Calls: non salvare audio raw; transcript come URL/hash.

## Ingestion security
- `x-ag-ts` (epoch ms), `x-ag-signature` = hex(HMAC_SHA256(secret, ts + "." + stableStringify(event)))
- Reject fuori finestra ±5 minuti

## Retention default
- eventi raw: 180 giorni (configurabile)
- aggregati: 24 mesi
