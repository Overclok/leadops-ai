
# Error catalog

Gli errori sono eventi `ERROR_RECORDED` con:
- error_code (enum)
- details (no segreti)
- retryable (bool)

**Querying Errors:**
- **Analytic Errors**: Use the `errors_view` SQL view for errors stored in the event stream.
- **System Logs**: Use the `error_logs` table for database or structural system errors.
