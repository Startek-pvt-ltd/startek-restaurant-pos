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
- Successful login/logout activity is recorded when audit logging is available. Password hashes are selected only for server-side bcrypt comparison and never added to the session.

### Dashboard

- `/dashboard` uses the authenticated shell and clearly isolated mock metrics/charts.
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

### Thermal receipts

- `/orders/[id]/receipt` is authenticated and renders stored order/payment snapshots for 80 mm paper.
- Customer information is never printed. Item columns are Item, Qty, and Total.
- Zero discount, tax, and service-charge lines are hidden. Tendered amount/change appear only for cash payments.
- The browser/system print dialog remains responsible for selecting Xprinter XP-80T.

### Placeholders

`/reports`, `/expenses`, and `/staff` are protected, responsive placeholders only. No reporting, expense-entry, export, or staff-management business logic is claimed in TASK-009.

## Stakeholders

- Client: Rice & Kottu Hut, No.32, Padukka Road, Meegoda
- Contact: 0777250493 / 0778375427
- Developer: Startek (PVT) LTD
- Version: 1.0.0
