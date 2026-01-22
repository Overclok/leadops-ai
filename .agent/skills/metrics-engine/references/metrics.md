
# Metrics engine reference

Conteggi base:
- email_sent: count EMAIL_SENT
- email_replied: count EMAIL_REPLIED
- email_no_reply: count EMAIL_NO_REPLY
- calls_outbound: count CALL_OUTBOUND_STARTED
- calls_inbound: count CALL_INBOUND_RECEIVED
- meetings_total: count MEETING_BOOKED_EMAIL + MEETING_BOOKED_PHONE
- deals_won/lost: count DEAL_WON / DEAL_LOST

Ranking prodotti “hot”:
score = 3*PRODUCT_SOLD + 1*PRODUCT_INTERESTED
order by score desc
