
# Call mapping

Vapi:
- inbound → CALL_INBOUND_RECEIVED
- outbound start → CALL_OUTBOUND_STARTED
- end → CALL_ENDED

Twilio (status callback):
- initiated/ringing/answered/completed → normalizza su CALL_OUTBOUND_STARTED/CALL_OUTBOUND_CONNECTED/CALL_ENDED

Idempotency_key:
- vapi: vapi:call:{call_id}:{event_name}
- twilio: twilio:call:{CallSid}:{CallStatus}
