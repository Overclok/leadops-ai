
---
name: calendly-events
description: Mappa Calendly webhook in MEETING_* deterministici (booked/canceled) con idempotenza e lead matching.
---

# Calendly Events Skill

## Istruzioni
1) Subscribe agli eventi (created/canceled).
2) n8n adapter → evento interno.
3) Lead matching da email/telefono invitee.
4) POST firmato a `/api/events`.
