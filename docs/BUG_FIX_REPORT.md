# TASK-009 Bug Fix Report

## Summary

The audit found scope leakage, authorization gaps, receipt-content drift, a duplicate-checkout UI race, broken placeholder navigation, and stale documentation. Focused fixes were applied without resetting PostgreSQL, deleting migrations, or removing historical models.

## Findings and resolutions

### BF-001 — Removed modules exposed in navigation and dashboard

- Severity: High
- Module: Dashboard, Navigation, Orders
- Description: Removed-scope customer/category surfaces were visible to users.
- Root cause: Earlier dashboard work still exposed Customers and a separate Categories top-level link, customer metrics/actions, and customer activity/order columns.
- Files: `AppSidebar.tsx`, dashboard page/components, order components/services/types
- Fix: Navigation now matches the approved list; customer UI/query projections were removed; categories remain inside Menu Management.
- Test evidence: Runtime source search and manual DOM QA show no removed modules.
- Remaining limitations: Historical customer relations remain in Prisma pending an approved data migration.

### BF-002 — Reports implementation exceeded stabilization scope

- Severity: High
- Module: Reports and dependencies
- Description: A complete reports/exports feature was present where only a placeholder is approved.
- Root cause: Uncommitted report routes, exports, charts, services, and PDF/ZIP dependencies were present even though TASK-009 permits only a placeholder.
- Files: former `src/app/reports`, `src/components/reports`, `src/features/reports`, package manifests
- Fix: Full implementation and export route were removed; dependencies were uninstalled; a protected placeholder was added.
- Test evidence: `/reports` loaded as a placeholder and the production route list contains no report-export route.
- Remaining limitations: Reporting remains intentionally unimplemented.

### BF-003 — Approved placeholder links were broken

- Severity: Medium
- Module: Application shell
- Description: Approved Expenses and Staff links resolved to missing routes.
- Root cause: Sidebar linked to Expenses and Staff without corresponding routes.
- Files: `src/app/expenses`, `src/app/staff`, `ModulePlaceholder.tsx`, Topbar, Proxy
- Fix: Added protected responsive placeholder routes and route metadata/proxy coverage.
- Test evidence: All approved navigation destinations returned HTTP 200 in manual QA.
- Remaining limitations: Expenses and Staff remain presentation-only placeholders.

### BF-004 — KITCHEN/inactive access not revalidated at the application boundary

- Severity: High
- Module: Authentication and authorization
- Description: Schema-only roles and stale active sessions could reach application routes.
- Root cause: Credentials authorization checked ACTIVE but allowed every schema enum role, and server session helpers trusted the JWT role/status after login.
- Files: `src/auth.ts`, `src/lib/auth-utils.ts`, `src/proxy.ts`
- Fix: Limited login to four approved roles; database-backed cached `requireAuth` rechecks status/current role; Proxy protects every approved route; mutations retain near-data authorization checks.
- Test evidence: Active admin, invalid/unknown login, logout, protected redirect, and login-page redirect passed.
- Remaining limitations: Inactive/KITCHEN and non-admin browser matrices were source-audited but not executed because matching fixtures do not exist.

### BF-005 — Receipt could print removed customer/custom content

- Severity: High
- Module: Receipt and printer settings
- Description: Legacy settings could re-enable prohibited customer data or non-approved footer copy.
- Root cause: A legacy setting controlled customer printing and editable footer copy.
- Files: receipt components, printer form/types/validation/service, seed
- Fix: Removed customer/custom-copy controls from runtime; ignored legacy fields; fixed required identity/footer; seeded customer visibility false.
- Test evidence: Existing cash/card receipt DOM contained no customer information and included the exact required header/footer.
- Remaining limitations: Legacy database columns remain for migration compatibility but are ignored by runtime code.

### BF-006 — Receipt layout/conditional lines did not match printer brief

- Severity: Medium
- Module: Thermal receipt
- Description: The receipt used an extra item column and printed zero-value adjustments.
- Root cause: Item table included Unit Price and totals always rendered Discount; optional zero Tax/Service lines could print.
- Files: `ReceiptItems.tsx`, `ReceiptTotals.tsx`, `globals.css`
- Fix: Reduced to Item/Qty/Total and suppressed zero-value adjustments while retaining 72 mm content width and print break protection.
- Test evidence: Existing cash/card receipts passed DOM inspection for columns and conditional lines.
- Remaining limitations: Physical Xprinter pagination/logo/print-dialog output requires the target workstation.

### BF-007 — Duplicate checkout possible before React pending state rendered

- Severity: High
- Module: POS checkout
- Description: A rapid second click could dispatch checkout before the pending render disabled controls.
- Root cause: Rapid repeated clicks could enter the handler twice before `useTransition` disabled the button.
- Files: `PosBillingScreen.tsx`
- Fix: Added synchronous ref-based submission lock, safe network failure handling, and retained server serializable/advisory/unique protections.
- Test evidence: Source audit confirmed synchronous handler locking plus serializable/advisory/unique server protection; build/type checks passed.
- Remaining limitations: A live double-submit checkout was not executed to avoid adding order data during stabilization QA.

### BF-008 — Seed recreated excluded table-management data

- Severity: Medium
- Module: Prisma seed
- Description: Running the seed recreated data for excluded table management.
- Root cause: Historical seed logic upserted 20 RestaurantTable rows.
- Files: `prisma/seed.ts`
- Fix: Removed future table seeding without deleting existing records.
- Test evidence: Seed source scan contains no RestaurantTable write or table-success log.
- Remaining limitations: Existing table rows/models are retained pending approved cleanup.

### BF-009 — Stale Next generated route types after removing report export

- Severity: Low
- Module: Next.js generated types
- Description: Ignored development artifacts referenced a route removed during scope cleanup.
- Root cause: `.next/dev/types/validator.ts` referenced the removed dynamic export route.
- Files: generated `.next` artifacts only
- Fix: Regenerated route types and removed the stale ignored validator artifact.
- Test evidence: `next typegen` refreshed route types and final `npm run typecheck` passed.
- Remaining limitations: `.next` remains generated/ignored and may be recreated by normal Next.js commands.

### BF-010 — Documentation claimed nonexistent/out-of-scope functionality

- Severity: High
- Module: Documentation
- Description: Project docs overstated Reports and retained removed-scope module claims.
- Root cause: Docs described Customers and a complete Reports/exports module and called receipt printing a placeholder.
- Files: README and all project/API/database/UI/task/milestone docs
- Fix: Reconciled documentation with deployed routes, exclusions, security boundaries, manual QA, and deferred schema cleanup.
- Test evidence: Documentation scope scan and manual file review no longer claim implemented report exports or customer navigation.
- Remaining limitations: Future module tasks must update placeholder status when genuinely implemented.

## Dependency audit

`npm outdated` showed non-breaking and major updates, but TASK-009 forbids force/breaking upgrades. `npm audit` reported 17 transitive advisories (2 moderate, 15 high) in ESLint/Prisma/Next-related chains. npm offered a force-only resolution that would introduce incompatible version changes; no forced update was applied. Reassess after upstream patched versions and framework compatibility testing are available.

## Deferred database cleanup

Historical excluded models/enums/columns remain intentionally. A future destructive migration requires confirmed backups, deployed-data usage analysis, retention approval, staged migration/deploy, and rollback verification.
