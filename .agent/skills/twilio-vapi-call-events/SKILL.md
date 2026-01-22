
---
name: twilio-vapi-call-events
description: Normalizza eventi chiamata da Vapi/Twilio in CALL_* deterministici con idempotenza e payload minimizzato.
---

# Twilio/Vapi Call Events Skill

## Istruzioni
1) n8n riceve webhook provider.
2) Mappa in CALL_* con idempotency_key stabile.
3) Minimizza payload (no audio raw).
4) POST firmato a `/api/events`.
