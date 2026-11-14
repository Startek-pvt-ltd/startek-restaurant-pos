# Monitoring and incident response

## Current baseline and proposed changes

GET /api/health performs SELECT 1 through Prisma and returns 200 with
status=ok, database=connected or 503 with database=unavailable. It is a
readiness check, NOT proof of correct checkout, data completeness or backups.
The proposed hardening branch adds a request correlation ID and structured
failure-only logging. No raw database error, connection URI or customer data
should be included in logs.

## Free/self-hosted monitor proposal (NOT configured)

Use an existing, trusted Uptime Kuma instance if available and authorized.
Monitor HTTPS GET /api/health every 5 minutes, require HTTP 200, alert after
2 consecutive failures and send recovery notifications. Monitor TLS certificate
expiry separately. Confirm monitor data retention and operational ownership.
Do not configure a provider, URL token or paid alerting integration by default.

Suggested alert thresholds after observing a clean baseline:
- Availability: 2 consecutive readiness failures (roughly 10 minutes).
- Backups: no verified off-device backup within 26 hours (once enabled).
- CI: merged build failure or a new high/critical production advisory.
- Database: pool exhaustion or repeated connection errors.
- Runtime: increased failure-only health events; correlate by X-Request-ID.

## Response and rollback

1. Verify public health endpoint and Netlify build status.
2. Inspect redacted logs by request ID; never paste secrets.
3. Determine whether failure is database, application, auth or networking.
4. Pause further deploys; preserve evidence and incident times (UTC).
5. Restore previous Netlify code deploy only with explicit incident approval;
   do not assume code rollback reverses database schema.
6. Escalate production recovery to the runbook and verified backups.
7. Postmortem: time to detect, time to mitigate, root cause, corrective tests.
