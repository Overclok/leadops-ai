# GDPR, Security & EU Compliance

**Last Updated**: 2026-01-22  
**Owner**: Agent A3 (Auth & Tenant Engineer)

---

## Overview
This document outlines the authentication, data isolation, and security measures implemented in LeadOps AI to ensure compliance with GDPR and EU data protection regulations.

---

## 1. Authentication & User Model

### Clerk Authentication
- **Provider**: [Clerk](https://clerk.com) (GDPR-compliant auth-as-a-service)
- **Model**: 1-user-per-tenant (strict single-user tenancy)
- **Data Storage**: User identity data (email, hashed passwords) stored by Clerk (EU region if configured)

### Tenant Isolation
- **Mapping**: Each Clerk `userId` maps to exactly **one** tenant UUID in Supabase.
- **Auto-Creation**: On first login, a tenant record is created with:
  - `owner_clerk_user_id`: Unique Clerk user identifier
  - `webhook_secret`: Randomly generated 32-byte hex secret for API auth
- **No Sharing**: Users cannot belong to multiple tenants (no Clerk Organizations used).

---

## 2. Data Isolation & Row-Level Security (RLS)

### Supabase RLS Policies
All tables (`tenants`, `leads`, `events`, `campaigns`, `products_services`, `deals`) have:
- **RLS Enabled**: Row-level security is ON by default.
- **Deny-All Policy**: Default policy denies all operations (`using (false)`).
- **Service Role Only**: Backend uses `SUPABASE_SERVICE_ROLE_KEY` with explicit `tenant_id` filtering.

### Runtime Tenant Enforcement
- **Source**: `apps/web/src/lib/tenant.ts`
- **Functions**:
  - `getOrCreateTenant()`: Resolves current user's tenant deterministically.
  - `getTenantId()`: Returns tenant UUID for queries.
  - `assertTenantOwnership(resourceTenantId)`: Throws if cross-tenant access detected.

**Example Usage**:
```typescript
const tenantId = await getTenantId();
const { data } = await supabase
  .from('leads')
  .select('*')
  .eq('tenant_id', tenantId); // Explicit filtering
```

---

## 3. Secret Management

### Environment Variables
Sensitive keys are stored in `apps/web/.env.local` (gitignored):
- `CLERK_SECRET_KEY`: Clerk backend secret (server-side only)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase admin key (server-side only)
- `AG_ADMIN_SECRET`: Internal webhook auth secret

### Webhook Secrets
- Each tenant has a unique `webhook_secret` (auto-generated on tenant creation).
- Used for HMAC signature validation on `/api/events` ingestion.
- Never exposed in logs or frontend.

---

## 4. Data Processing & Event Model

### Append-Only Events
- All user activity is stored as immutable events in the `events` table.
- Each event has:
  - `tenant_id`: Owner tenant UUID
  - `idempotency_key`: Prevents duplicate processing
  - `occurred_at`: Event timestamp (UTC)
  - `payload`: Minimal JSON data (no PII unless explicitly needed)

### Data Minimization
- Only essential fields are stored (name, email, phone for leads).
- No unnecessary tracking or profiling data.

### Right to Erasure (GDPR Article 17)
To delete a tenant's data:
```sql
DELETE FROM tenants WHERE id = '<tenant_id>';
```
This will cascade-delete all related `leads`, `events`, `campaigns`, `deals`, and `products_services`.

---

## 5. Access Control Summary

| Route                     | Auth Required | Tenant Isolation |
|---------------------------|---------------|------------------|
| `/` (homepage)            | No            | N/A              |
| `/dashboard`              | Yes           | ✅ Yes            |
| `/api/tenant`             | Yes           | ✅ Yes            |
| `/api/metrics`            | Yes           | ✅ Yes            |
| `/api/events` (inbound)   | No (HMAC)     | ✅ Yes            |
| `/api/internal/*`         | Yes           | ✅ Yes            |

---

## 6. Logging & Monitoring

### Error Handling
- **No PII in Logs**: Error messages do not expose user emails, phone numbers, or secrets.
- **Structured Logs**: All errors include `tenant_id` for debugging (but not user PII).

### Audit Trail
- All events in the `events` table serve as an append-only audit log.
- Includes `source` (e.g., `gmail`, `vapi`, `calendly`), `occurred_at`, and `created_at`.

---

## 7. Third-Party Integrations

### Providers with EU Data Residency
- **Supabase**: EU region (Frankfurt recommended)
- **Clerk**: EU region configurable
- **n8n**: Self-hosted (full data control)

### Data Processors
- **Gmail API**: Google Workspace (GDPR-compliant via DPA)
- **Vapi/Twilio**: Voice call providers (check DPA terms)
- **Calendly**: Meeting scheduling (check DPA terms)

**Action Required**: Ensure Data Processing Agreements (DPAs) are signed with all providers.

---

## 8. Encryption

### In-Transit
- All API calls use HTTPS/TLS 1.2+.
- Clerk SDK handles secure session management.

### At-Rest
- Supabase Postgres databases are encrypted at rest (provider default).
- Webhook secrets stored in plaintext in DB (consider encryption if high-risk).

---

## 9. Compliance Checklist

- [x] **Authentication**: Clerk with EU region
- [x] **Tenant Isolation**: 1-user-per-tenant model enforced
- [x] **RLS Policies**: Deny-all default, service role with filtering
- [x] **Secret Hygiene**: `.env.local` gitignored, no secrets in code
- [x] **Data Minimization**: Minimal PII stored
- [x] **Audit Trail**: Append-only event log
- [ ] **DPAs Signed**: With Gmail, Vapi, Twilio, Calendly
- [ ] **Cookie Consent**: Not yet implemented (required for EU)
- [ ] **Data Export**: API endpoint for user data export (GDPR Article 20)
- [ ] **Privacy Policy**: Public-facing policy document

---

## 10. Contact & DPO
For data protection inquiries, contact:  
**Data Protection Officer (DPO)**: [TBD]  
**Email**: [TBD]

---

**Document Version**: 1.0 (Initial)  
**Last Reviewed**: 2026-01-22
