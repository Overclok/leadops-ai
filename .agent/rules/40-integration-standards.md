
# 40 — Integration standards

Pattern standard: Provider → n8n adapter → POST `/api/events` (firmato) → Supabase.

Firma (HMAC):
- Header: `x-ag-ts` (epoch ms), `x-ag-signature` (hex)
- Payload: JSON dell'evento
- Stringa firmata: `${ts}.${stableStringify(event)}`
- Algoritmo: HMAC-SHA256 con `tenant.webhook_secret` (Supabase: table `tenants`)

n8n:
- webhook “onReceived” + HTTP Request “fire-and-forget”
- niente “wait response” per processi lunghi
- idempotency_key stabile (provider id)

Provider:
- Gmail: push Pub/Sub watch (preferito)
- Calendly: webhook subscription
- Vapi/Twilio: webhooks call events
