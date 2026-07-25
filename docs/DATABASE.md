# Database

PostgreSQL is accessed through Prisma ORM 7 and the PostgreSQL driver adapter. Connection settings belong in the root `.env` file as `DATABASE_URL`; never commit credentials. Copy `.env.example` and replace its example credentials for local development.

The schema covers restaurant configuration, users, menu categories and items, tables, customers, orders and payments, suppliers and inventory, expenses, activity logs, and system settings.

## Commands

- `npm run prisma:generate` regenerates Prisma Client after schema changes.
- `npm run prisma:migrate -- --name <migration-name>` creates and applies a development migration.
- `npm run prisma:seed` safely upserts the required baseline data.
- `npm run prisma:studio` opens the local database browser.

Production environments should apply checked-in migrations with `npx prisma migrate deploy`.
