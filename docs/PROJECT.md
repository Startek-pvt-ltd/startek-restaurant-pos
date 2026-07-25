# Project

Startek Restaurant POS is the restaurant management platform for Rice & Kottu Hut. The application includes a maintainable Next.js foundation, PostgreSQL persistence, Auth.js credential authentication with role-based access control, and a responsive management dashboard.

## Product scope

Approved application modules are Dashboard, POS Billing, Menu Management, Orders, Customers, Reports, Expenses, Staff, Settings, and Logout.

The product does not include table management, a kitchen display system, inventory management, or supplier management. These excluded areas must not appear in navigation, dashboards, alerts, or future feature planning.

## Dashboard

- The protected `/dashboard` route uses the existing authenticated session.
- Dashboard statistics, charts, recent orders, best-selling items, expenses, and activity currently use clearly isolated mock presentation data.
- No sales calculations, business APIs, or dashboard database queries are implemented in TASK-004.
- Navigation supports a fixed desktop sidebar and a drawer on tablet and mobile screens.

## Menu and category management

- `/menu` provides database-backed menu item search, category and availability filters, sorting, card and table layouts, and LKR price formatting.
- `/menu/categories` provides category search, display-order sorting, item counts, status controls, and protected create, update, and delete workflows.
- Super admins, owners, and managers can manage menu data. Cashiers receive a read-only catalogue, and all mutation permissions are rechecked on the server.
- Item images may use an `http(s)` URL or a local `/menu-items/...` path. Missing images use the built-in food placeholder.
- Menu operations use validated Server Actions and Prisma services; no business API route is required.

## Authentication

- Active users can authenticate with either username or email and a bcrypt-protected password.
- Auth.js stores an encrypted JWT session in a secure, HTTP-only cookie. Sessions last eight hours by default or 30 days when the user explicitly selects remember me.
- Protected server code uses `requireAuth`, `requireRole`, and `hasRole` from `src/lib/auth-utils.ts`.
- Successful login and logout events are written to `ActivityLog` when database logging is available.
- `/dashboard` requires authentication, while signed-in users are redirected away from `/login`.

## Stakeholders

- Client: Rice & Kottu Hut, No.32, Padukka Road, Meegoda
- Contact: 0777250493 / 0778375427
- Developer: Startek (PVT) LTD
- Version: 1.0.0
