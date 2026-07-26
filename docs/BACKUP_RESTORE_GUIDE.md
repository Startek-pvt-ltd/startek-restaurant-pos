# Backup and restore guide

## Configuration

Set `BACKUP_DIR` to an existing private directory outside the web root. The application process needs read/write access; web servers must not serve it. Keep `DATABASE_URL` and authentication secrets only in the deployment secret store. Install `pg_dump` and `pg_restore`, or configure `PG_DUMP_PATH` and `PG_RESTORE_PATH` with executable paths only.

On macOS, PostgreSQL client tools may be installed with Homebrew's PostgreSQL/libpq packages. Follow Homebrew's current instructions to put the tools on `PATH`; do not hardcode a Homebrew path because Intel and Apple Silicon locations differ.

## Backup behavior

Full backups use compressed PostgreSQL custom format and include schema plus data. Credentials are passed through the child-process environment, not command arguments. Each output is checked for existence and non-zero size, hashed with SHA-256, and recorded in `BackupRecord`. Backup and restore operations share an atomic private lock. Partial files are removed after failure.

Recommended retention, after an administrator explicitly enables an infrastructure policy:

- Daily: keep 7
- Weekly: keep 4
- Monthly: keep 12

The application does not automatically delete backups.

## Restore safeguards and manual process

The web application performs only a SUPER_ADMIN preflight: exact phrase, current password, acknowledgement, completed record, canonical path, file existence, and checksum. It never reports a live restore as successful.

1. Announce a maintenance window and stop POS checkout traffic.
2. Create and independently verify a new pre-restore full backup.
3. Enable maintenance mode and stop application processes connected to PostgreSQL.
4. Copy the dump and checksum to a restricted administration host; verify SHA-256 again.
5. Inspect it using `pg_restore --list <backup.dump>`.
6. Restore into an empty staging database first and run migration status plus application smoke tests.
7. A qualified PostgreSQL administrator may restore production using `pg_restore` with connection parameters supplied by the secure environment. Review ownership and cleanup options for that environment; never paste credentials into shell history.
8. Run `npx prisma migrate deploy`; verify connectivity, core tables, restaurant configuration, and at least one active SUPER_ADMIN.
9. Start the application and verify authentication, POS, orders, and settings.
10. Disable maintenance mode only after health checks pass and record the result.

Cloud providers, schedules, object-storage integrations, and silent destructive restore are not implemented.
