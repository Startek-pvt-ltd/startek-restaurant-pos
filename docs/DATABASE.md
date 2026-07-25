# Database

PostgreSQL is accessed through Prisma ORM 7 and the PostgreSQL driver adapter. `DATABASE_URL` belongs in `.env`; never commit production credentials.

## Active runtime data

- Restaurant and SystemSetting: billing and receipt configuration
- User and ActivityLog: authentication, roles, and audit history
- Category and MenuItem: POS catalogue
- Order, OrderItem, and Payment: immutable billing history and price/payment snapshots
- Expense: retained for the approved future Expenses module

## Transaction and integrity rules

- POS checkout uses a serializable transaction for Order, OrderItem, Payment, and ActivityLog.
- Invoice numbers use `RKH-YYYYMMDD-NNNN`, a PostgreSQL transaction advisory lock, bounded retries, and the unique `Order.orderNumber` constraint.
- Menu prices use decimal columns and are reloaded on checkout; `OrderItem.unitPrice` and `totalPrice` preserve history.
- Order cancellation is a status/audit update, never a physical delete.
- Foreign keys restrict deletion of users/menu items needed by history; child order items/payments cascade only with an order, although runtime code never deletes orders.

## Historical models retained intentionally

`RestaurantTable`, `Customer`, `Supplier`, `InventoryItem`, `StockTransaction`, their relations, `TableStatus`, `StockMovement`, and `KITCHEN` remain in the checked-in schema and old migrations. They are not used by the current UI/runtime.

Removing them now would require a destructive migration and could discard deployed data. Cleanup is deferred to a separately approved data-retention/migration task with backups, usage verification, and an explicit rollback plan. TASK-009 does not delete migrations, reset the database, or remove existing records.

The seed no longer creates restaurant tables and defaults customer receipt visibility off. It preserves existing menu/order data and creates sample menu items only when none exist.

## Receipt settings compatibility

Legacy SystemSetting columns for customer visibility and custom footer copy remain for migration compatibility. Runtime receipt rendering ignores customer visibility and uses the approved fixed identity/footer. This avoids a destructive schema change while preventing old settings from re-enabling removed content.

## Verified commands

- `npx prisma format`
- `npx prisma validate`
- `npm run prisma:generate`
- `npx prisma migrate status`

Production should apply checked-in migrations with `npx prisma migrate deploy`. Prisma Studio remains available through `npm run prisma:studio`.
