
# Error catalog

Gli errori sono eventi `ERROR_RECORDED` con:
- error_code (enum)
- details (no segreti)
- retryable (bool)

**Querying Errors:**
Errors can be queried efficiently using the `errors_view` SQL view, which filters for `ERROR_RECORDED` types and extracts JSON payloads.
