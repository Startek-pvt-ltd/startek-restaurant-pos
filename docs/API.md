# API and Server Boundaries

## Auth.js

Auth.js exposes its standard GET/POST handlers at `/api/auth/[...nextauth]` for credentials sign-in, session handling, CSRF protection, and sign-out. Use Auth.js clients rather than sending unvalidated application payloads directly.

There are no unauthenticated public business APIs. Existing mutations use Server Actions; TASK-011 adds authenticated, read-only report export handlers.

## Authorization contract

- `requireAuth` verifies the encrypted Auth.js session and rechecks the current user status/role in PostgreSQL. The JWT callback also compares `User.sessionVersion`, invalidating revoked sessions.
- `requireRole` adds route-level role enforcement.
- `hasRole` supports UI and server permission decisions.
- Approved application roles are `SUPER_ADMIN`, `OWNER`, `MANAGER`, and `CASHIER`; inactive accounts and `KITCHEN` are rejected.
- Proxy performs only the optimistic session redirect. Server Actions and services repeat authorization near every mutation.

## Menu Server Actions

Category and menu-item create/update/toggle/delete operations validate Zod payloads, authorize `SUPER_ADMIN`, `OWNER`, or `MANAGER`, call Prisma services, return constrained messages, and revalidate menu routes. Cashiers are read-only.

## POS checkout Server Action

`completeOrderAction` accepts item IDs/quantities, order type, notes, discount input, payment method, and cash received. It never accepts trusted browser totals.

The service reloads the active cashier, menu prices/availability/category status, tax, and service charge. It calculates all totals server-side and atomically creates the order, item snapshots, payment, and activity entry. Known validation errors are mapped to safe cashier messages; unexpected database details are logged only on the server.

## Order Server Actions

- `completeOrderStatusAction` validates an order UUID and atomically transitions only a pending order to completed.
- `cancelOrderAction` validates a UUID and required cancellation reason, permits only `SUPER_ADMIN`, `OWNER`, or `MANAGER`, retains the order, and writes cancellation/audit metadata.
- Order query parameters are parsed with Zod before Prisma filters are constructed.

## Expense Server Actions

- `createExpenseAction` validates the complete payload, rechecks the active `SUPER_ADMIN`/`OWNER`/`MANAGER` role, and transactionally creates the expense plus `EXPENSE_CREATED` activity.
- `updateExpenseAction` repeats validation and authorization, uses the last-seen `updatedAt` value to reject concurrent edits, and records `EXPENSE_UPDATED`.
- `deleteExpenseAction` permits only active `SUPER_ADMIN` or `OWNER` accounts, checks the last-seen version, and records `EXPENSE_DELETED` before physically deleting within the same transaction.
- Action responses contain only constrained success/field/user-safe error messages. Prisma records and database internals are not returned to the browser.

## Report export handler

`GET /reports/export/[report]` accepts a validated report name, `format=csv|xlsx`, and the same URL filters as the report UI. It rechecks `SUPER_ADMIN`, `OWNER`, or `MANAGER` access before querying.

Supported report names are `overview`, `sales`, `items`, `payments`, `cashiers`, and `expenses`. Responses are private/non-cacheable attachments with safe filenames. Invalid filters return `400`, unknown reports return `404`, and unexpected export failures return a generic `500` without exposing Prisma/PostgreSQL details.

CSV uses UTF-8 with safe escaping. Excel is a genuine SpreadsheetML `.xlsx` package with typed numeric cells, LKR formats, calculated column widths, frozen headers, filters, metadata, and totals. Direct PDF generation is intentionally omitted; the A4 print layout uses the operating-system Print/Save as PDF dialog.

## Staff and profile Server Actions

- `createStaffAction`, `updateStaffAction`, `changeStaffStatusAction`, and `resetStaffPasswordAction` validate constrained payloads, reload the active actor inside the transaction, enforce the role hierarchy, return safe messages, and revalidate affected staff routes.
- `updateProfileAction` accepts only full name, email, phone, and avatar. `changeOwnPasswordAction` requires the current password and revokes sessions after a successful bcrypt update.
- Client-provided roles never grant authority. SUPER_ADMIN may manage approved roles; OWNER may manage MANAGER/CASHIER; MANAGER may manage CASHIER; CASHIER is denied at the route and mutation boundaries.
- No staff endpoint returns password hashes, session versions, tokens, or auth secrets. Physical user deletion is intentionally not exposed.

## Printer settings and receipts

Printer settings use a protected Server Action. Managers can configure printer display name, fixed 80 mm width, auto-open/auto-print preferences, logo, copies, and optional non-zero tax/service display. Customer printing and custom receipt identity/footer copy are not exposed.

Receipt pages are server-rendered from stored snapshots and use the browser/system print dialog. No direct USB, network, or cash-drawer API exists.

## Settings Server Actions

`updateRestaurantSettingsAction`, `updateBillingSettingsAction`, `updateReceiptSettingsAction`, `updatePrinterSettingsAction`, and `updateSystemSettingsAction` accept constrained payloads, re-check the active actor in the database transaction, record an `ActivityLog`, and revalidate settings/POS/order paths. Restaurant logo uploads use generated filenames and server-side size, MIME, and file-signature checks. No REST API routes were added.

POS checkout reloads current typed settings on the server, enforces enabled payment methods, notes and discount limits, and generates invoices from the validated prefix/padding. Browser totals remain untrusted.

## Backup and export handlers

- Backup create/delete and restore-preflight mutations are authenticated Server Actions with database-backed roles and Zod validation.
- `GET /settings/backup/download/[id]` validates UUID, actor, completed status, canonical private path, and physical file before streaming a private attachment.
- `GET /settings/data-export/download` validates dataset, format, dates, and supported filters before returning CSV, genuine `.xlsx`, or JSON.
- Responses omit passwords, sessions, secrets, database URLs, and private backup paths. Completed operations write safe activity events.
