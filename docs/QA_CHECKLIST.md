# QA Checklist

Executed on 2026-07-26 in the local `fix/system-stabilization` workspace.

## Automated checks

- [x] Prisma schema formatted
- [x] Prisma schema validated
- [x] Prisma Client generated
- [x] All five checked-in migrations reported applied/up to date
- [x] ESLint passed
- [x] TypeScript check passed after refreshing stale generated Next route types
- [x] Production build passed
- [x] npm-only lockfile consistency confirmed
- [x] `npm outdated` reviewed without forced/breaking upgrades
- [x] `npm audit` reviewed; force-only dependency-chain fixes deferred

## Authentication and access

- [x] Valid active seeded admin login succeeds
- [x] Invalid password is rejected with a safe generic message
- [x] Unknown username is rejected with the same safe generic message
- [x] Logout destroys the browser session
- [x] Unauthenticated `/orders` access redirects to `/login` with callback URL
- [x] Authenticated user is redirected away from `/login`
- [x] Protected routes load with the active session
- [x] Browser session/DOM contains user identity and role but no password hash
- [x] `.env.example` contains placeholders only; real `.env` remains ignored
- [x] Source audit confirms inactive accounts and KITCHEN are rejected
- [x] Source audit confirms eight-hour default and 30-day remembered-session expiry timestamps
- [ ] Browser login with an inactive fixture was not executed; no inactive test user was added to preserve existing user data
- [ ] Browser role matrix for OWNER/MANAGER/CASHIER was not executed; only the seeded SUPER_ADMIN account exists locally
- [ ] Session expiry was not time-elapsed in the browser; expiry logic was source-audited

## Navigation and responsive UI

- [x] Sidebar contains only approved top-level modules
- [x] Reports, Expenses, and Staff routes show protected placeholders
- [x] Customer/table/kitchen/inventory/supplier links and dashboard content are absent
- [x] Dashboard quick actions resolve to working approved routes
- [x] Mobile navigation drawer opens and exposes approved links
- [x] Mobile Dashboard and POS content remain accessible
- [x] Browser console recorded no application errors during route/interaction QA

## Menu management

- [x] Menu and category pages load from PostgreSQL
- [x] Category create/update/status/delete exercised with a temporary QA fixture
- [x] Menu item create/update/availability/delete exercised with a temporary QA fixture
- [x] Temporary fixtures were deleted and original counts restored
- [x] Search/filter/sort controls and empty-state code paths audited
- [x] Server Actions repeat role authorization and Zod validation

## POS billing

- [x] Category filtering reduced Kottu products to three
- [x] Instant product search isolated Chicken Kottu
- [x] Add/increase/decrease/remove cart controls passed
- [x] Fixed discount recalculated `Rs. 1,250.00` to `Rs. 1,150.00`
- [x] Dine-In selection and order notes passed
- [x] Exact-cash control produced `Rs. 0.00` balance
- [x] Empty cart and insufficient cash disabled checkout
- [x] Persisted test state restored to empty/default values
- [x] Server pricing, availability, settings, invoice locking, and transaction code audited
- [ ] A new checkout was not submitted to avoid adding production-like order data during stabilization QA

## Orders and receipts

- [x] Order list, statistics, filters, invoice-only search, and pagination loaded
- [x] Invoice search returned the expected single record
- [x] Order detail and receipt routes loaded existing records
- [x] Customer UI is absent from list, detail, and receipt
- [x] Cash receipt displayed amount received and balance
- [x] Card receipt hid amount received and balance
- [x] Receipt item headings are Item, Qty, Total
- [x] Zero discount/tax/service-charge lines are hidden
- [x] Required restaurant header/footer text is present
- [x] 80 mm print CSS and no-print selectors audited
- [ ] Completion/cancellation writes were not executed against existing orders; transactional and role-validation paths were source-audited
- [ ] Physical Xprinter output was not tested; browser/system printer selection requires the target workstation and printer

## Data preservation

- [x] No migrations deleted or rewritten
- [x] No database reset performed
- [x] No existing order/menu/user records removed or overwritten
- [x] Obsolete schema models retained and documented for planned migration cleanup

## TASK-010 Expenses Management

Executed on 2026-07-26 in the local `feature/expenses` workspace.

- [x] Safe expense migration applied without a reset or deleted migration
- [x] Prisma Client regenerated; schema validation and migration status passed
- [x] `/expenses` remains inside the authenticated dashboard shell
- [x] Seeded super admin received HTTP 200 and the complete expense page content
- [x] Authenticated Cashier fixture received HTTP 307 to `/dashboard?error=forbidden`; fixture and login log were removed
- [x] `SUPER_ADMIN` and `OWNER` create/view/edit/delete policy is enforced server-side
- [x] `MANAGER` create/view/edit policy and delete denial are enforced server-side
- [x] `CASHIER` route and mutation access are denied server-side
- [x] Required title/category/date and positive two-decimal amount validation implemented
- [x] Future dates, overlong reference numbers, and overlong descriptions are rejected
- [x] Search covers title, reference number, and description
- [x] Category/date filters, four sort modes, and 10/20/50-row pagination implemented
- [x] Today, Monday-to-date week, month-to-date, and filtered totals use Prisma Decimal aggregates
- [x] Create/update/delete activity events include actor, expense ID, safe title, and timestamp
- [x] Concurrent edit/delete conflicts use `updatedAt` optimistic checks and safe messages
- [x] Responsive mobile cards and desktop table include accessible actions and dialogs
- [x] Loading, error, empty, validation, authorization, and database-error states implemented
- [x] Database-backed temporary-fixture suite passed 20 validation, CRUD, permission, query, total, concurrency, and audit assertions; all fixtures were removed
- [x] Production build exposed `/expenses` as a dynamic server-rendered route
- [ ] In-app viewport interaction could not be completed because the browser tab did not attach to the local test session; responsive behavior was source/build verified
- [ ] Physical printer output, reporting exports, P&L, payroll, and receipt-image storage are outside TASK-010

## TASK-011 Reports and Analytics

Executed on 2026-07-26 in the local `feature/reports` workspace.

- [x] Financial fixture covered Dine-In cash, Takeaway card, Delivery QR, completed/cancelled, discounted/zero-discount, two menu categories, two cashiers, two expense categories, and exact range boundaries
- [x] Database-backed suite passed 19 formula, exclusion, filter, pagination, item snapshot, cashier, expense, CSV, and Excel assertions
- [x] Gross sales `680.00`, discounts `30.00`, tax `57.00`, service charge `15.00`, net sales `722.00`, expenses `125.00`, and estimated net revenue `597.00` reconciled exactly
- [x] Cancelled `999.00` order remained visible but was excluded from sales, item, payment, and cashier completed revenue
- [x] Historical OrderItem price and quantity calculations passed
- [x] Cash payment revenue, received amount, and change were separated correctly
- [x] Custom Colombo date boundaries and reversed-range rejection passed
- [x] Sales pagination returned 10 then 2 records; order-type filtering passed
- [x] CSV contained all 12 filtered rows
- [x] Excel opened in an independent workbook reader, exposed typed values/LKR formatting, had no formula errors, passed ZIP integrity, and passed a visual render after column-width repair
- [x] Temporary orders, payments, items, expenses, users, exports, and verification artifacts were removed
- [x] Three report composite indexes applied without modifying financial records
- [x] All six report pages loaded in the production server with no browser console warnings/errors and no page-level horizontal overflow at 390 px, 1024 px, or the default desktop viewport
- [x] URL-backed custom dates, order type, payment method, status, sort, and page-size filters persisted in the rendered controls
- [x] Authenticated CSV and Excel downloads returned HTTP 200; Excel passed ZIP integrity and MIME checks; invalid custom export ranges returned HTTP 400
- [x] Unauthenticated report access redirected to login; an authenticated temporary CASHIER redirected to `/dashboard?error=forbidden` for both report pages and exports, then was removed with its login activity
- [ ] Direct PDF generation is intentionally not included; the tested A4 print stylesheet uses the browser's Print / Save PDF workflow

## TASK-012 Staff Management and Role Administration

Executed on 2026-07-26 in the local `feature/staff` workspace.

- [x] Safe migrations added `lastLogin`, `sessionVersion`, role/last-login indexes, and case-insensitive username/email uniqueness without changing existing users
- [x] Prisma Client regenerated; schema validation and all nine migrations passed
- [x] Database-backed suite passed 24 role, validation, hash, CRUD, filtering, pagination, revocation, profile, audit, and sensitive-field assertions
- [x] SUPER_ADMIN created OWNER, MANAGER, and CASHIER; OWNER created MANAGER/CASHIER; MANAGER created CASHIER and was denied OWNER creation
- [x] Duplicate username/email casing, weak passwords, self-deactivation, final-owner deactivation, and final-super-admin protection logic were rejected
- [x] Password reset and self-service password change stored bcrypt hashes and incremented session versions
- [x] HTTP role tests returned 200 for SUPER_ADMIN/OWNER/MANAGER, redirected CASHIER to forbidden, and rejected an inactive user's login session
- [x] Staff search, role/status filtering, last-login sorting support, and two-page pagination were exercised
- [x] Staff list/details/profile payloads contain no password or session-version fields
- [x] Activity logs covered STAFF_CREATED, STAFF_UPDATED, STAFF_DEACTIVATED, STAFF_PASSWORD_RESET, PROFILE_UPDATED, and PASSWORD_CHANGED
- [x] Browser QA verified the four approved form roles, no KITCHEN option, profile link/page, safe staff details, mobile cards at 390 px, and no console warnings/errors
- [x] All 14 temporary staff accounts and associated targeted/login activity were removed; original financial/order/expense data was untouched
- [x] Physical staff deletion is intentionally unavailable; account deactivation preserves historical records
## TASK-013 settings verification

- [x] Typed Prisma migration applied without deleting existing orders
- [x] Restaurant/billing/receipt/printer/system schemas reject invalid values
- [x] At least one payment method and safe invoice prefix/padding are required
- [x] SUPER_ADMIN/OWNER/MANAGER/CASHIER permission boundaries are enforced server-side
- [x] Developer credit changes are accepted only for SUPER_ADMIN
- [x] Logo upload uses a generated path, 2 MB limit, allowlisted MIME, and magic-byte verification
- [x] Receipt zero-line and cash-only tender rules are wired to rendering
- [x] Browser print test and Xprinter XP-80T setup guide are present
- [x] Current settings feed new POS checkouts; completed order monetary snapshots remain intact
- [x] Prisma validate, seed, migration status, lint, type-check, and production build pass
- [ ] Cross-browser visual/mobile pass and physical Xprinter output require a cashier workstation
