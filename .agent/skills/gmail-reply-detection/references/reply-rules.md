
# Reply rules

Obiettivo: distinguere reply umane vs auto-reply vs bounce.

Heuristic:
- Auto-Submitted != "no" → auto-reply
- Precedence: auto_reply → auto-reply
- X-Autoreply/X-Autorespond → auto-reply

Output eventi:
- reply umano → EMAIL_REPLIED
- auto-reply → ERROR_RECORDED (MAPPING_ERROR o altro) + flag `is_auto_reply=true` nel payload
- bounce → EMAIL_BOUNCED oppure ERROR_RECORDED (DELIVERY_FAILURE)
