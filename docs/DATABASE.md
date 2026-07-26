# Database

PostgreSQL is accessed through Prisma ORM 7 and the PostgreSQL driver adapter. `DATABASE_URL` belongs in `.env`; never commit production credentials.

## Active runtime data

- Restaurant and SystemSetting: billing and receipt configuration
- User and ActivityLog: authentication, roles, and audit history
- Category and MenuItem: POS catalogue
- Order, OrderItem, and Payment: immutable billing history and price/payment snapshots
- Expense: operating-expense records, dates, references, decimal amounts, creator, and audit timestamps

## Transaction and integrity rules

- POS checkout uses a serializable transaction for Order, OrderItem, Payment, and ActivityLog.
- Invoice numbers use `RKH-YYYYMMDD-NNNN`, a PostgreSQL transaction advisory lock, bounded retries, and the unique `Order.orderNumber` constraint.
- Menu prices use decimal columns and are reloaded on checkout; `OrderItem.unitPrice` and `totalPrice` preserve history.
- Order cancellation is a status/audit update, never a physical delete.
- Foreign keys restrict deletion of users/menu items needed by history; child order items/payments cascade only with an order, although runtime code never deletes orders.
- Expense money uses `Decimal(12,2)`. `expenseDate` is a PostgreSQL `DATE`; `updatedAt` supports optimistic concurrency checks. Expense create/update/delete and the corresponding activity entry share a database transaction.
- Staff create/update/status/password operations and their activity entries use transactions. `User.sessionVersion` increments to revoke issued JWTs after deactivation, activation, password reset, or self-service password change; `User.lastLogin` records successful sign-in activity.

## Staff identity and session migrations

- `20260726164000_add_staff_session_fields` adds nullable `lastLogin`, non-null `sessionVersion` defaulting to zero, and indexes for role and last-login queries without changing existing users.
- `20260726164500_add_staff_case_insensitive_uniques` adds PostgreSQL unique functional indexes on lowercase username and lowercase non-null email. This matches case-insensitive authentication and prevents ambiguous case-only duplicate accounts.
- Prisma `@unique` constraints remain on username/email. The User status index already existed; KITCHEN remains only for migration compatibility and is excluded from staff queries/forms.

## Report query strategy

- Completed-order Prisma aggregates calculate subtotals, discounts, tax, service charges, grand totals, counts, and averages using database decimals.
- Cancellation counts use separate `CANCELLED` predicates. Cancelled orders never enter sales, item, payment, or cashier revenue.
- Menu performance groups `OrderItem` snapshots by `menuItemId`; current menu prices are never substituted for historical `unitPrice`/`totalPrice`.
- Payment revenue uses paid payment `amount`; `receivedAmount` and `changeAmount` remain tender-only metrics.
- Independent aggregates run in parallel, selected fields avoid oversized records, grouped queries avoid N+1 reads, and detail tables use pagination.
- Order timestamps use half-open Colombo boundaries (`start <= createdAt < day-after-end`). Expense `DATE` values use inclusive start/end dates.

Migration `20260726113000_add_report_query_indexes` adds `Order(status, createdAt)`, `Payment(paymentMethod, orderId)`, and `Expense(category, expenseDate)` composite indexes. Existing unique/single-column indexes already cover invoice, cashier, order type, item, and remaining report filters.

## Expense migration

Migration `20260726093000_add_expenses_management` adds `expenseDate`, optional `referenceNumber`, `updatedAt`, and an expense-date index without deleting rows. Existing rows are backfilled from their Colombo-local `createdAt` date. Legacy enum values are translated as `UTILITIES → ELECTRICITY`, `PURCHASE → INGREDIENTS`, and `REPAIR → MAINTENANCE`; unchanged categories retain their original value.

## Historical models retained intentionally

`RestaurantTable`, `Customer`, `Supplier`, `InventoryItem`, `StockTransaction`, their relations, `TableStatus`, `StockMovement`, and `KITCHEN` remain in the checked-in schema and old migrations. They are not used by the current UI/runtime.

Removing them now would require a destructive migration and could discard deployed data. Cleanup is deferred to a separately approved data-retention/migration task with backups, usage verification, and an explicit rollback plan. TASK-009 does not delete migrations, reset the database, or remove existing records.

## Notification model

Migration `20260726190000_add_notifications` adds typed, per-user operational notifications with title, safe message, optional link, read state, creation time, and read time. The composite `(userId, read, createdAt)` index supports the topbar unread counter and recent-notification query. Deleting a user cascades only that user’s notification inbox; business and audit records are unaffected.

New orders retain the existing `discount`, `tax`, and `serviceCharge` columns for historical compatibility, but checkout writes zero to all three fields and calculates `grandTotal` from server-priced menu item snapshots only.

The seed no longer creates restaurant tables and defaults customer receipt visibility off. It preserves existing menu/order data and creates sample menu items only when none exist.

## Receipt settings compatibility

Legacy SystemSetting columns for customer visibility and custom footer copy remain for migration compatibility. Runtime receipt rendering ignores customer visibility and uses the approved fixed identity/footer. This avoids a destructive schema change while preventing old settings from re-enabling removed content.

## Verified commands

- `npx prisma format`
- `npx prisma validate`
- `npm run prisma:generate`
- `npx prisma migrate status`
- `npx prisma migrate deploy`

Production should apply checked-in migrations with `npx prisma migrate deploy`. Prisma Studio remains available through `npm run prisma:studio`.

## Cash closing

Migration `20260727100000_add_cash_sessions` adds `CashSessionStatus`, `ExpensePaymentMethod`, the `CashSession` table, audit foreign keys, filter indexes, and a PostgreSQL partial unique index allowing only one global `OPEN` session. Existing expenses receive the conservative `OTHER` default, preventing historical unclassified expenses from incorrectly reducing a cash drawer.

POS checkout and closing use serializable transactions and row locks. Expected cash is opening cash plus completed paid cash sales minus `CASH` expenses. Card/QR sales, non-cash expenses, and cancelled orders are excluded from the physical drawer calculation.

## TASK-013 migration

Migration `20260726045700_add_typed_restaurant_system_settings` non-destructively extends `Restaurant` with structured address/contact/locale fields and `SystemSetting` with typed billing, receipt, printer, and system preferences. Existing identifiers and historical order monetary snapshots are unchanged. Legacy receipt columns remain for compatibility; new explicit zero-line flags drive receipt rendering.

## Backup metadata

Migration `20260726061353_add_backup_records` adds `BackupType`, `BackupStatus`, and `BackupRecord`. Metadata includes the safe filename, private server path, status, byte size, SHA-256 checksum, actor, timestamps, safe failure reason, database version, and application version. Deletion marks a row `DELETED`; history remains. Private paths are never selected for UI history or data exports.
