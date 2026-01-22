# Dashboard contract

## Contract Definition
The dashboard structure (KPI cards, filters, tables) is strictly defined in:
`docs/dashboard.contract.json`

## UI Rules
- **KPI Cards**: Must implement drill-down on click (where applicable).
- **Filters**: `period` affects all compatible widgets.
- **Refresh**: Dashboard should support periodic refresh or manual reload.

## Widgets
Refer to `version: 1` in the JSON contract for the authorized list of widgets:
- `email_sent`, `email_replied`, `email_no_reply`
- `calls_outbound`, `calls_inbound`
- `meetings_total`
- `deals_won`, `deals_lost`
