
# Calendly mapping

- invitee.created → MEETING_BOOKED_EMAIL o MEETING_BOOKED_PHONE
- invitee.canceled → MEETING_CANCELED

Idempotency_key:
- calendly:invitee:{invitee_uri}:{event}
