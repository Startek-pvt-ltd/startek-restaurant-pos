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
