# Metrics

## KPI
- Email inviate / risposte / senza risposta
- Chiamate fatte / ricevute
- Appuntamenti (email/telefono) + cancellati
- Deal opened / won / lost
- Campagne
- Prodotti/servizi venduti + ranking “più caldi”

**Implementation Note:**
Aggregations are available via the `analytics_kpi_daily` SQL view.

## Derived Event: `EMAIL_NO_REPLY`
- **Trigger**: 5 calendar days after `EMAIL_SENT`.
- **Condition**: Generate ONLY IF none of the following occurred for the same Lead/Thread in the window:
  - `EMAIL_REPLIED`
  - `EMAIL_BOUNCED` (or delivery failure)
  - `MEETING_BOOKED_*`
  - `DEAL_OPENED` / `STOP_SEQUENCE`
- **Output**: `EMAIL_NO_REPLY` event with deterministic ID (e.g. `evt_noreply_<original_msg_id>`).

## Follow-up Auto Guardrails (EU-Safe)
1. **No Pixel Dependency**: Logic must NOT rely on `EMAIL_OPENED` (often blocked). Rely only on lack of reply.
2. **Frequency Cap**: Max 1 email / 3 days (default).
3. **Hard Stop**:
   - Explicit "STOP" or "UNSUBSCRIBE" reply (via Regex or AI classifier).
   - Bounce or Delivery Failure (cleaning list automatically).
