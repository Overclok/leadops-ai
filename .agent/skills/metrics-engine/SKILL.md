
---
name: metrics-engine
description: Calcola KPI deterministici (email/call/meetings/deals/campaigns/products) a partire da eventi append-only e regole ufficiali. Usalo quando devi definire regole di calcolo, aggregazioni e output dashboard.
---

# Metrics Engine Skill

## Inputs
- Event stream conforme a `references/event-schema.json`
- Enum ufficiali in `references/enums.json`
- Definizioni in `references/metrics.md`

## Regole hard
- EMAIL_NO_REPLY viene generato come evento derivato dopo 5 giorni (calendario) dall’ultimo EMAIL_SENT senza reply.
- Output dashboard deve rispettare `docs/dashboard-contract.md`.

## Scripts
- `scripts/generate_types.py`
- `scripts/build_dashboard_contract.py`
