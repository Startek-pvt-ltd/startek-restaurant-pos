# Startek Restaurant POS — Integrated Phase 2.3–2.8 Hardening Report

**Date:** 14 November 2026
**Repository:** kevin-menuja/startek-restaurant-pos
**Baseline main:** 20e91c3f465cea94c14752ac1f2e5d1b1ecf5359
**Change management:** Isolated Git branches only. NO merge into main, NO Netlify deployment, NO production data modification, NO paid services enabled.

## Executive outcome

Three independent branches were prepared and verified together in a detached,
unpublished integration checkout. The combined checkout passed TypeScript,
ESLint, 33 unit tests, Prisma schema validation, local PostgreSQL migration
tests, atomic login-throttle integration tests, a hermetic Netlify-compatible
cloud build, a standalone local build, and the existing browser POS acceptance
suite on a disposable database with synthetic records.

**Important: this is validated development work, NOT a production release.**

## Branches and exact scope

1. security/phase2-auth-hardening (ae071b6121718606d1d418df5c18d16ff3a20c93)
   - PostgreSQL-backed, identifier-scoped login attempts using a HMAC-SHA-256
     digest derived with AUTH_SECRET; no raw username or email in throttle table.
   - Additive AuthLoginThrottle Prisma model and SQL migration.
   - Atomic upsert: 15-minute window; attempt 8 is blocked for 10 minutes.
   - Generic sign-in failure; fail closed when throttle storage is unavailable;
     clear attempt counter after a valid login.
   - Unit tests plus disposable PostgreSQL integration tests for threshold,
     window reset and concurrent requests.
2. security/phase2-http-observability (19d32d41b9c358d965a76d6d8eab42152ea5b676)
   - Global anti-framing and plug-in CSP directives, X-Frame-Options DENY,
     X-Content-Type-Options nosniff, Referrer-Policy and Permissions-Policy.
   - Health-check correlation ID and structured failure-only log event
     restricted to predefined fields, avoiding raw PostgreSQL exception data.
   - Targeted tests for headers and sanitized event records.
3. docs/phase2-recovery-quality (initial e72253be8cadf0861536d09f02d2211f69274ccb)
   - Recovery runbook, authentication acceptance criteria, monitoring and
     incident response, risk-based release gates.
   - CI extension: run the SQL login-throttle test only if present, against
     the preexisting disposable PostgreSQL job database.

All three tracks were combined in an uncommitted detached local worktree
by applying their patches, not through any merge into main.

## Workstream status

| ID | Workstream | Evidence | Remaining release gate |
|---|---|---|---|
| 2.3 | Database protection and recovery | Staging snapshot and isolated Neon branch recovery; localhost dump and restore separately verified earlier | Actual Netlify Production database target and encrypted offsite backup NOT verified |
| 2.4 | Authentication hardening | Atomic HMAC-keyed throttle, SQL integration tests, unchanged JWT revocation | Provider-trusted IP abuse controls and migration approval |
| 2.5 | HTTP/API protection | Enforced anti-framing baseline and browser smoke test | Strict script CSP/nonce and broader server-action authorization audit |
| 2.6 | Observability | Readiness request IDs, sanitized failure logs, documented monitoring | No external alert provider configured; verify logs in staging after deployment |
| 2.7 | Quality | 33/33 unit tests, local synthetic E2E, standalone and cloud builds | PR-specific CI before production approval |
| 2.8 | Documentation | Runbooks and consolidated report | Update release records only after final deployment |

## Verified integration test evidence

- Node 22.23.1, npm ci from the checked-in lockfile in a real isolated worktree.
- Prisma schema validation: PASS.
- TypeScript noEmit: PASS.
- ESLint: PASS.
- Unit tests: 33 tests / 33 passed / 0 failed.
- PostgreSQL 18 disposable database: startek_portfolio_6ed3b527ef8687.
- Fresh Prisma migrate deploy and migrate status: PASS.
- Throttle SQL tests: first seven attempts allowed, eighth blocked,
  ninth does not extend the block, expired window resets, eight concurrent
  attempts serialize to exactly eight: PASS.
- Disposable database seeding: PASS. No production or existing Neon records used.
- Cloud build: npm run build:netlify PASS using unreachable synthetic Neon URL,
  and independent local node_modules installed via npm ci. NO cloud deployment.
- Standalone local build: npm run build PASS, health responded correctly.
- Browser E2E: PASS using a synthetic database. The suite exercised login,
  roles and access control, checkout across cash/card/QR, receipt snapshotting,
  order idempotency, exports, disabled user revocation, mobile routes, and
  the isolated local backup workflow.
- Runtime HTTP test: login HTTP 200 with CSP frame-ancestors none, object-src
  none and base-uri self; X-Frame-Options DENY; nosniff; Referrer-Policy and
  Permissions-Policy. Anonymous dashboard redirected to login: PASS.
- Production dependency audit: 0 vulnerabilities.
- Full dependency audit including development tools: 8 moderate advisories,
  0 high, 0 critical. Evaluate separately before future major upgrades.

## Production database mapping: UNRESOLVED / CRITICAL

Netlify Production DATABASE_URL and AUTH_SECRET exist, but the CLI returns
masked values (not the hostname). The correct production database project,
branch and endpoint remain UNVERIFIED. A healthy /api/health response proves
only SELECT 1 connectivity, not database identity.

The accessible Neon staging project is ancient-hall-55236885 and includes:
- br-frosty-wildflower-b31fbzs3: staging (root/default).
- br-super-bonus-b3kvbj5v: desktop-original-staging (populated).
- br-green-leaf-b352qrh7: isolated drill copy of populated branch.
- br-crimson-hat-b3n2drfv: verified copy from staging root snapshot.
- snap-icy-haze-b3rhpkan: manual snapshot of staging root ONLY.

**Do not assume ANY listed Neon branch is Netlify Production.**
A previous snapshot restore unintentionally reassigned the project default and
endpoint associations; these branch names and default status were corrected.
Keep future production restore procedures under strict approval and endpoint
mapping checks.

Local backup and restore evidence on the user's Mac applies only to localhost
PostgreSQL, not to the Netlify production database. Never commit local dumps.

## Risks and tradeoffs (ranked)

1. CRITICAL: Production database identity and true encrypted, offsite production
   backup have not been independently verified. No new production migration.
2. HIGH: Identifier-only throttling can be exploited to lock an account
   deliberately. Add a provider-trusted IP/bot-abuse control and privileged
   unlock workflow before any public production rollout.
3. HIGH: The throttle table grows with attempts; establish a bounded retention
   cleanup policy and monitor table size before enabling it in production.
4. HIGH: Monitoring and backup failure alerting are runbooks, not live services.
5. MEDIUM: CSP currently prevents embedding and plug-ins but does not enforce
   a nonce-backed script-src; a future stricter CSP needs browser compatibility
   tests for Auth.js and POS receipt rendering.
6. MEDIUM: Eight moderate development-tooling npm advisories remain.
7. MEDIUM: GitHub CI extensions will only be truly verified after an approved
   pull request runs; this execution intentionally opened no PR or deployment.

## Required release sequence

1. Obtain the exact Netlify Production database hostname and database name
   from its authorized secret manager, and match it to a Neon endpoint without
   disclosing the URI or password.
2. Capture a verified encrypted offsite dump from that exact database,
   checksum it, independently restore it to a new database and validate data.
3. Review and approve the additive throttle migration, abuse-resistant
   protection, and account lockout response/clearance procedure.
4. Review all three Git branches together; create a draft PR only after
   explicitly authorizing Netlify Deploy Preview builds and associated usage.
5. Run fresh GitHub CI, Netlify preview checks, synthetic integration suite,
   production-specific monitoring rehearsal, and security review.
6. Obtain explicit approval to merge/deploy; monitor health, auth and checkout;
   record post-release rollback and incidents. Never rely on a code rollback to
   undo a database migration.

## Proof of nonproduction isolation

The integrated checkout is detached from main and has not been pushed.
The three source branches contain no .env files, SQL dumps or customer records.
The disposable PostgreSQL databases were created on the user's localhost.
No Netlify preview or production deployment was triggered by the work.

## Related runbooks

- docs/operations/PRODUCTION_DATABASE_RECOVERY.md
- docs/operations/AUTHENTICATION_SECURITY.md
- docs/operations/OBSERVABILITY.md
- docs/operations/PHASE2_ACCEPTANCE.md
