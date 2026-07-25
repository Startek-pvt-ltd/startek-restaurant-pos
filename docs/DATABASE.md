# Database

PostgreSQL is accessed through Prisma ORM 7 and the PostgreSQL driver adapter. Connection settings belong in the root `.env` file as `DATABASE_URL`; never commit credentials. Copy `.env.example` and replace its example credentials for local development.

The schema covers restaurant configuration, users, menu categories and items, tables, customers, orders and payments, suppliers and inventory, expenses, activity logs, and system settings.

## Menu data operations

- `Category.name` is unique and categories are ordered by `displayOrder` and name.
- `MenuItem` belongs to one category; category deletion uses the existing restrictive foreign key so related items cannot be orphaned.
- Menu prices remain PostgreSQL decimals and are serialized as decimal strings before reaching Client Components.
- The seed creates ten sample menu items only when the menu item table is empty. Existing menu records and edited prices are never overwritten.
- Images are stored as URL/path strings only. Local files belong in `public/menu-items`; no binary image data is stored in PostgreSQL.

## Commands

- `npm run prisma:generate` regenerates Prisma Client after schema changes.
- `npm run prisma:migrate -- --name <migration-name>` creates and applies a development migration.
- `npm run prisma:seed` safely upserts the required baseline data.
- `npm run prisma:studio` opens the local database browser.

Production environments should apply checked-in migrations with `npx prisma migrate deploy`.
