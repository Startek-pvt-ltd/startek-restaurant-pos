# Authentication and API hardening acceptance checklist

Current Auth.js JWT sessions consult the User table for revocation and status.
The Netlify Edge proxy checks signed cookies without importing Prisma.

Proposed hardening on isolated authentication branch:
- Add a PostgreSQL login-attempt table containing only HMAC-SHA-256 keyed
  account identifier digests (no plaintext identifiers).
- Use atomic PostgreSQL upsert, 15-minute window, 8th attempt blocked for
  10 minutes; return generic errors in the login UI.
- Clear the counter after successful credentials verification.
- Reject logins if throttle storage or signing secret is unavailable.
- Verify concurrency, lockout boundary, and expired-window behavior in an
  isolated PostgreSQL integration test.

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
