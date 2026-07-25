# Database

PostgreSQL is accessed through Prisma ORM 7 and the PostgreSQL driver adapter. Connection settings belong in the root `.env` file as `DATABASE_URL`; never commit credentials. Copy `.env.example` and replace its example credentials for local development.

The schema covers restaurant configuration, users, menu categories and items, tables, customers, orders and payments, suppliers and inventory, expenses, activity logs, and system settings.

## Menu data operations

- `Category.name` is unique and categories are ordered by `displayOrder` and name.
- `MenuItem` belongs to one category; category deletion uses the existing restrictive foreign key so related items cannot be orphaned.
- Menu prices remain PostgreSQL decimals and are serialized as decimal strings before reaching Client Components.
- The seed creates ten sample menu items only when the menu item table is empty. Existing menu records and edited prices are never overwritten.
- Images are stored as URL/path strings only. Local files belong in `public/menu-items`; no binary image data is stored in PostgreSQL.

## POS billing records

- `Order.orderType` uses `DINE_IN`, `TAKEAWAY`, or `DELIVERY` and defaults to `TAKEAWAY` for backward compatibility.
- `Order.notes` stores optional whole-order preparation notes.
- Completed checkout snapshots menu prices into `OrderItem.unitPrice` and `OrderItem.totalPrice`.
- `Payment.receivedAmount` and `Payment.changeAmount` preserve cash tender and change while card and QR payments leave them null.
- Billing writes use a serializable transaction so partial orders or payments are never stored.

## Order management and cancellation

- `Order.cancellationReason`, `Order.cancelledAt`, and `Order.cancelledById` form a nullable cancellation audit trail and preserve all existing order history.
- `cancelledById` references `User` with `ON DELETE SET NULL`; the textual reason and timestamp remain if the user is later removed.
- Cancellation and pending-order completion update the order and create an `ActivityLog` inside the same database transaction.
- Invoice numbers use `RKH-YYYYMMDD-NNNN`. Checkout takes a PostgreSQL transaction-level advisory lock for the Colombo calendar-date prefix, reads the next four-digit sequence, and relies on the unique `Order.orderNumber` constraint as a final safeguard.
- Order list queries use indexed order date/status fields, relation filters for customer and payment data, and database `skip`/`take` pagination.

## Commands

- `npm run prisma:generate` regenerates Prisma Client after schema changes.
- `npm run prisma:migrate -- --name <migration-name>` creates and applies a development migration.
- `npm run prisma:seed` safely upserts the required baseline data.
- `npm run prisma:studio` opens the local database browser.

Production environments should apply checked-in migrations with `npx prisma migrate deploy`.
