# QA Checklist — TASK-009

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
