# Authentication and API hardening acceptance checklist

Current Auth.js JWT sessions consult the User table for revocation and status.
The Netlify Edge proxy checks signed cookies without importing Prisma.

Proposed hardening on isolated authentication branch:
- Add a PostgreSQL login-attempt table containing only HMAC-SHA-256 keyed
  account identifier digests (no plaintext identifiers).
- Canonicalize known users by UUID after lookup, so their email and
  username aliases share one account throttle bucket.
- Atomic PostgreSQL upsert: 15-minute window, 8th attempt blocked for
  10 minutes, and a reset when the lock expires.
- Apply a second 100-request/15-minute client-IP threshold only when a
  valid platform-injected X-Nf-Client-Connection-Ip header is available.
  Ignore untrusted X-Forwarded-For. Verify the header survives the Auth.js
  Node runtime in a real Deploy Preview before relying on this defense.
- Keep generic UI errors for invalid, inactive and blocked identities.
- Clear only the account counter after successful credentials verification.
- Reject logins if throttle storage or signing secret is unavailable.
- Verify concurrency, account alias normalization, lock expiry, network
  threshold and window reset against disposable PostgreSQL.
- Run the 30-day stale-throttle cleanup utility in DRY-RUN mode by default.
  Any apply needs database-name confirmation and remote authorization.

KNOWN TRADEOFF: this is an identifier-only limiter. An attacker can deliberately
lock out a known account. Before a production rollout, add provider-trusted
per-client-IP / bot-abuse controls and a tested privileged unlock procedure;
do not rely on spoofable X-Forwarded-For or process-local Map state in serverless.

Additive database migration requires a verified live backup and explicit
production migration authorization. Do not deploy before those gates clear.

Proposed HTTP baseline: DENY framing, CSP frame-ancestors/object-src/base-uri,
nosniff, strict-origin-when-cross-origin, and conservative Permissions-Policy.
This is NOT a complete anti-XSS CSP: script-src restrictions require dynamic
nonces and browser QA across POS printing, login, reports, and receipts.

Remaining security checks:
- Verify CSRF defenses in Auth.js and mutations.
- Review every server action's authorization and input validation.
- Validate CORS, upload/content-disposition, cookie secure/SameSite settings.
- Verify auth/session logout, disabled staff, permission changes and re-login.
- Review retained development-only npm advisories and rerun audit.
- Rehearse incident response with no customer database mutations.


## Throttle retention procedure

The helper at scripts/maintenance/prune-login-throttle.mjs supports DRY-RUN
mode by default. With a privately supplied DATABASE_URL, run:

    node scripts/maintenance/prune-login-throttle.mjs --dry-run

The tool only reports the eligible count. After separately verifying the
database name, apply mode needs the exact database-name confirmation:

    POS_MAINTENANCE_CONFIRM_DATABASE=exact-database-name node scripts/maintenance/prune-login-throttle.mjs --apply

Remote databases require a separate explicit authorization plus the
POS_REMOTE_DB_MAINTENANCE_APPROVED=true environment variable. Never paste
live credentials into CI, source files, terminal history or logs. The
cleanup affects only AuthLoginThrottle entries older than 30 days; no
users, orders or payment records are touched.

## Operational risks

- Attackers can still deliberately lock a known account; per-IP controls
  do not prevent distributed attacks. Provide administrator recovery
  and platform-level bot protection before production.
- Validate Netlify's trusted header in a deploy preview first.
- Shared restaurant NAT addresses can hit the network limit; monitor real
  volumes before release and have an authorized unlock procedure.
- HMAC-keyed rows cannot be recognized after signing-secret rotation,
  but are removed by retention cleanup without storing identifiers.
