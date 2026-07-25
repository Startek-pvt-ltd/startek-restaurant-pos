# API and Server Boundaries

## Auth.js

Auth.js exposes its standard GET/POST handlers at `/api/auth/[...nextauth]` for credentials sign-in, session handling, CSRF protection, and sign-out. Use Auth.js clients rather than sending unvalidated application payloads directly.

There are no public business API routes. TASK-009 does not implement report exports or new APIs.

## Authorization contract

- `requireAuth` verifies the encrypted Auth.js session and rechecks the current user status/role in PostgreSQL.
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

## Printer settings and receipts

Printer settings use a protected Server Action. Managers can configure printer display name, fixed 80 mm width, auto-open/auto-print preferences, logo, copies, and optional non-zero tax/service display. Customer printing and custom receipt identity/footer copy are not exposed.

Receipt pages are server-rendered from stored snapshots and use the browser/system print dialog. No direct USB, network, or cash-drawer API exists.
