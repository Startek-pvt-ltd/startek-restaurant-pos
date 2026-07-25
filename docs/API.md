# API

Auth.js exposes its standard GET and POST handlers at `/api/auth/[...nextauth]`. These handlers provide CSRF-protected credential sign-in, JWT session inspection, and sign-out. They must be accessed through Auth.js clients rather than called with unvalidated application data.

No business API endpoints are included yet. Future endpoints should live in App Router route handlers, validate inputs with Zod, call `requireAuth` or `requireRole`, keep business logic in feature services, and return consistent typed error responses.

## Menu operations

TASK-005 intentionally uses authenticated Server Actions instead of public business API routes. Category and menu item create, update, availability/status toggle, and delete operations:

- validate untrusted payloads with shared Zod schemas;
- require an authenticated `SUPER_ADMIN`, `OWNER`, or `MANAGER` on every mutation;
- call the isolated Prisma service layer;
- return a constrained success or user-safe error result; and
- revalidate `/menu` and `/menu/categories` after successful writes.

Cashiers can load both pages but cannot invoke a successful write. Category deletion is rejected while related menu items exist, and menu items referenced by order history must be marked unavailable instead of deleted.

## POS checkout

TASK-006 uses the authenticated `completeOrderAction` Server Action instead of adding a public checkout API. It accepts menu item identifiers and quantities, order type, notes, discount input, and payment input.

The server does not trust client prices or calculated totals. It reloads current menu prices, availability, the cashier account, and restaurant tax/service settings before calculating and writing the order. The order, line items, paid payment, cash tender/change, and activity log are committed in one serializable PostgreSQL transaction.

Allowed roles are `SUPER_ADMIN`, `OWNER`, `MANAGER`, and `CASHIER`. `KITCHEN` cannot access or submit POS billing.

## Order operations

TASK-007 uses authenticated Server Actions and server-rendered Prisma queries; it does not add a public business API.

- `completeOrderStatusAction` accepts only a validated order UUID and transitions a pending order to completed.
- `cancelOrderAction` accepts a validated UUID and cancellation reason, requires `SUPER_ADMIN`, `OWNER`, or `MANAGER`, preserves the order, and writes its audit metadata.
- Both actions authenticate and authorize independently of the rendered page, return constrained user-safe results, update `ActivityLog`, and revalidate the list and detail routes.
- Order list query parameters are treated as untrusted input and parsed with Zod before Prisma filters are constructed.

## Printer settings and receipts

Receipt printing does not expose a printer API. The authenticated `/orders/[id]/receipt` page renders stored order/payment snapshots and invokes the browser/system print dialog. `updatePrinterSettingsAction` validates Xprinter display, fixed 80 mm paper, separate preview/print automation, conditional receipt content, custom footer copy, and one-to-three copies. Only `SUPER_ADMIN`, `OWNER`, or `MANAGER` may update these preferences.
