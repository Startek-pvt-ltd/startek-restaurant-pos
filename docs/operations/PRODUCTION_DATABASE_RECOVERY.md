# Production database identity and recovery runbook

**Status on 14 November 2026: production database identity UNVERIFIED.**

This is a release-gate document, not a claim that the production backup is complete.
Netlify masks protected environment-variable values in the CLI. A non-empty
Production DATABASE_URL is evidence that the setting exists, NOT evidence
identifying its PostgreSQL host, branch, database, or backup status.

## Nonnegotiable safety checks

1. Inspect the Production DATABASE_URL only in the authorized Netlify settings
   and/or trusted secret manager. Never paste it into chat, PRs, build logs, tickets,
   repositories or a terminal history. Record only Neon project ID, branch ID,
   hostname and database name after independent confirmation.
2. Match the exact endpoint hostname to the Neon project's endpoint under
   Branches -> Compute. Do not infer production identity from project names,
   source data counts, or a healthy /api/health response.
3. Confirm the branch is not a recovery drill branch, and confirm the original
   production credentials are preserved. A separate branch or database with the
   same schema is not equivalent to production.
4. Check for active transactions and coordinate a maintenance window for any
   restore or credential change. Never restore onto a source branch while the
   application accepts orders.
5. Before any migration or rollout, create an independently verified, encrypted,
   off-device backup of the IDENTIFIED live database. Record checksum, storage
   location, UTC timestamp and retention in a private operations log.
6. Perform restore rehearsals against a new empty database with distinct
   credentials; compare schema, migrations, users, orders, payments and sample
   order totals. Never overwrite source data or run a test checkout in production.
7. Have an explicit rollback plan. Code rollback through Netlify does not
   necessarily reverse a database migration. Keep schema changes additive.

## Observations (staging only, not verified production)

Neon project ID: ancient-hall-55236885.
Known branches:
- staging: br-frosty-wildflower-b31fbzs3 (original root/default)
- desktop-original-staging: br-super-bonus-b3kvbj5v (populated)
- recovery-drill-2026-11-14-desktop-original: br-green-leaf-b352qrh7
- snapshot-restore-verified-2026-11-14: br-crimson-hat-b3n2drfv

Manual snapshot of the root staging branch:
snap-icy-haze-b3rhpkan. This snapshot does NOT establish a production backup.

**Critical vendor behavior observed:** restoring a Neon snapshot with a new
branch name unexpectedly promoted the restored branch to project default,
renamed the prior default and changed endpoint assignments. The default and
names were restored afterward. Do not use restore_snapshot in production without
a separately reviewed vendor-specific dry run, restore target, compute mapping,
and explicit authorization. Prefer read-only verification and creating an
isolated copy for rehearsal.

The local Macintosh POS full pg_dump was restored into a disposable local
PostgreSQL database with matching record counts. This does NOT back up hosted
Netlify Production. The local dump and its checksum must remain private.

## Recovery procedure (after the production branch is conclusively identified)

- Document incident commander, incident start (UTC), current RPO/RTO and impacts.
- Stop writes using an approved maintenance mechanism (do not improvise a switch).
- Confirm the latest off-device dump's checksum and PostgreSQL version.
- Restore into a separately created clean database, not the live branch.
- Check pg_restore exit status, applied Prisma migration count, key table counts,
  no broken foreign keys, currency totals and role availability.
- Run an isolated application smoke suite including authenticated read-only
  pages and synthetic checkout in the sandbox only.
- Document cutover/rollback plan and obtain explicit authorization before
  redirecting the live application to the recovered database.
- Observe at least the first business-critical period after a cutover, retaining
  the original source for investigation until an approved retention period ends.

## Backup frequency and targets (proposals, not configured)

- Target RPO <= 24 hours and RTO <= 4 hours only after end-to-end drills prove them.
- Propose daily encrypted physical/offsite logical backups, 7 daily, 4 weekly,
  12 monthly retention after verifying costs, storage and privacy requirements.
- Arrange alerts for failed or stale backups, missing offsite copy, low disk space,
  and failed restore verification.
- Do not enable paid Neon snapshots or Netlify build hooks without approval.
- Never expose customer records or reuse Production AUTH_SECRET in test.
