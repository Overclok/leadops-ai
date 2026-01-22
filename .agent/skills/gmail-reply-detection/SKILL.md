
---
name: gmail-reply-detection
description: Rileva reply in Gmail e genera eventi EMAIL_REPLIED distinguendo auto-reply/bounce. Usalo per configurare n8n adapter e la logica di classificazione.
---

# Gmail Reply Detection Skill

## Goal
Eventi Gmail affidabili per KPI.

## Istruzioni
1) Ricevi notifica (push Pub/Sub watch consigliato) o polling.
2) Carica headers + threadId.
3) Classifica (vedi `references/reply-rules.md`).
4) Mappa a eventi interni e invia a `/api/events` con idempotency_key = provider message id.
