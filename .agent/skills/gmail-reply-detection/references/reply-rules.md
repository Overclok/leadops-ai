
# Reply rules

## 1. Trigger Configuration (n8n)
- **Strategy**: Polling (every 5-10m) or Push (Watch).
- **Filter**: `label:INBOX is:unread -from:me -label:processed_leadops`
- **Action**: Fetch email -> Process -> Apply label `leadops_processed`.

## 2. Reply Detection Strategy
Reliable mapping requires 3 checks:
1. **Thread ID**: Match `provider_thread_id` with LeadOps `thread_id`.
2. **References**: Check `In-Reply-To` / `References` headers to link to specific `message_id`.
3. **Sender**: Must match Lead email (or domain for loose matching).

## 3. Classification Rules

### KPI Reply (`EMAIL_REPLIED`)
- **Criteria**:
  - `Auto-Submitted` header is MISSING or `no`.
  - Subject does NOT start with `Automatic reply:` (or localized variants).
  - Body does NOT contain standard OOTO phrases.
- **Impact**: Stops sequence, changes status to `CONTACTED` or `NEGOTIATION`.

### Non-KPI / Auto-Reply
- **Event**: `ERROR_RECORDED` or special event with `reply_type=AUTO_REPLY`.
- **Criteria**:
  - `Auto-Submitted` != `no` (e.g. `auto-generated`, `auto-replied`).
  - Headers `X-Autoreply` or `X-Autorespond` present.
- **Action**: Do NOT stop sequence (unless policy says otherwise), do NOT count as engagement.

### Bounces (`EMAIL_BOUNCED`)
- **Criteria**: From `mailer-daemon`, `postmaster`, or status code 5.x.x.
- **Action**: Mark lead as `DORMANT` or `LOST`.
