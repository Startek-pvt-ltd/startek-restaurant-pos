# Project

Startek Restaurant POS is the authenticated restaurant billing platform for Rice & Kottu Hut.

## Approved scope

The application navigation is exactly: Dashboard, POS Billing, Menu Management, Orders, Reports, Expenses, Staff, Settings, and Logout. Dine-In, Takeaway, and Delivery are supported order types.

The following are excluded: Customer Management, Table Management, Kitchen Display, Inventory Management, Supplier Management, and PickMe/Uber-specific workflows. Excluded modules must not appear in navigation, dashboard cards, POS, order UI, receipts, alerts, or future-task claims.

## Implemented modules

### Authentication

- Active `SUPER_ADMIN`, `OWNER`, `MANAGER`, and `CASHIER` accounts may authenticate by username or email.
- `KITCHEN` remains a historical enum value but cannot authenticate into application workflows.
- Protected routes use an optimistic Auth.js Proxy check and a database-backed `requireAuth` check close to server data access.
- Successful login/logout activity and `lastLogin` are recorded when audit logging is available. A database-backed session version revokes existing JWT sessions after deactivation or password changes. Password hashes are selected only for server-side bcrypt comparison and never added to the session.

### Dashboard

- `/dashboard` uses the authenticated shell with real summary/card charts where implemented and clearly isolated mock secondary presentation data.
- Customer/table/inventory/kitchen/supplier references are absent.
- Quick actions link only to approved working routes.

### Menu Management

- `/menu` and `/menu/categories` use Prisma data, Zod validation, Server Actions, responsive views, and safe error messages.
- Super admins, owners, and managers may mutate menu data; cashiers have read-only access.
- Referenced items cannot be deleted from order history and should be marked unavailable.

### POS Billing

- `/pos` loads categories, products, prices, and restaurant settings from PostgreSQL.
- Zustand persists the cart and one held order on the cashier device.
- The server reloads current prices/availability/settings, validates payment and discounts, and writes Order, OrderItem, Payment, and ActivityLog in one serializable transaction.
- A synchronous submission lock, database advisory lock, retry handling, and the unique invoice constraint protect checkout against duplicate submissions/invoices.

### Orders

- `/orders` provides invoice search, date/type/payment/status filters, sorting, statistics, and pagination.
- `/orders/[id]` displays the invoice snapshot, cashier, order type, items, totals, payment, notes, and cancellation audit.
- Orders are never physically deleted. Completion and authorized cancellation are transactional and audited.

### Reports and Analytics

- `/reports` and its Sales, Menu Items, Payments, Cashiers, and Expenses sections use live PostgreSQL data only.
- URL-backed presets/custom ranges use `Asia/Colombo`; cancelled orders remain visible in cancellation metrics and are excluded from every revenue calculation.
- CSV and `.xlsx` exports contain the complete filtered dataset, restaurant identity, selected range, generated timestamp, and totals. A4 browser printing also supports the operating system’s Save as PDF workflow.
- Super admins, owners, and managers may view, export, and print. Cashiers are rejected by both report pages and export handlers.
- Estimated Net Revenue means completed grand totals minus recorded expenses; it is not accounting profit.

### Expenses

- `/expenses` provides PostgreSQL-backed create, view, edit, and owner-level delete workflows.
- Search, category/date filters, amount/date sorting, pagination, and daily/weekly/monthly/filtered totals are calculated server-side.
- Super admins and owners have full access; managers may create/view/edit; cashiers may view, search, filter, create, and edit only their own expenses. Cashiers cannot delete expenses or edit another user’s records. Every mutation repeats authorization on the server.
- Create, update, and deletion events are recorded in `ActivityLog`. Physical deletion requires explicit confirmation and writes its audit record in the same transaction before removal.

### Staff Management

- `/staff` provides safe PostgreSQL-backed search, approved-role/status filters, sorting, pagination, responsive account cards/table, and create/edit/status/password-reset dialogs.
- `/staff/[id]` shows contact/account metadata, last login, recent safe activity, order counts, completed sales, and expense counts without selecting password or session secrets.
- Super admins manage all approved roles; owners manage managers/cashiers; managers manage cashiers only; cashiers are denied. Every mutation repeats authorization against the active database account.
- Deactivation is preferred to deletion. Self-deactivation, privilege escalation, the final active super admin, and the final active owner are protected. Referenced users are never physically deleted by this module.
- `/settings/profile` lets any active application user update safe profile fields and change their password after current-password verification.

### Thermal receipts

- `/orders/[id]/receipt` is authenticated and renders stored order/payment snapshots for 80 mm paper.
- Customer information is never printed. Item columns are Item, Qty, and Total.
- Zero discount, tax, and service-charge lines are hidden. Tendered amount/change appear only for cash payments.
- The browser/system print dialog remains responsible for selecting Xprinter XP-80T.

### POS UX and notifications

- The authenticated sidebar collapses to an icon rail on desktop/tablet, retains accessible labels/tooltips, persists the preference locally, and becomes a closing drawer on mobile.
- The topbar notification center provides per-user unread state and safe operational notices for orders, expenses, menu availability, staff administration, and backups.
- New POS checkouts are subtotal-only: discount, tax, and service charge are forced to zero by the server, so grand total equals the server-priced item subtotal. Historical order snapshots remain unchanged.

### Out of scope

Payroll, attendance, shifts, salary calculations, email recovery, forecasting, full accounting, tax-return calculations, and excluded operational modules are not implemented.

## Stakeholders

- Client: Rice & Kottu Hut, No.32, Padukka Road, Meegoda
- Contact: 0777250493 / 0778375427
- Developer: Startek (PVT) LTD
- Version: 1.0.0

## TASK-013 settings

The settings hub now covers restaurant identity, billing rules, receipt content, browser printer preferences, system preferences, and the existing self-service profile. SUPER_ADMIN has full access; OWNER manages restaurant/billing/receipt/printer/profile; MANAGER has read-only restaurant/billing/system access and may update receipt/printer operations; CASHIER is restricted to profile. Developer credit and product controls are protected on the server.

## TASK-014 backup and export

The protected settings area now provides native PostgreSQL backup creation/history/download/deletion, guarded restore preparation, and filtered CSV/Excel/JSON exports. Backup files are private and checksummed. Customer, table, kitchen, inventory, supplier, PickMe, and Uber data are excluded. Automated destructive restore and scheduled/cloud backups remain outside scope.

## TASK-016 daily cash closing

Cashiers and management can open the single restaurant register at `/cash-closing`, monitor database-derived totals, and close it with an actual count, password re-authentication, and explicit confirmation. Managers can close any session; cashiers can close only their own. Immutable history and printable reports live under `/cash-closing/history`.
