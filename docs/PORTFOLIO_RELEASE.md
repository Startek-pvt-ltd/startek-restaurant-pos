# v1.0.0 portfolio release verification

The source of truth is the original Rice & Kottu Hut project and [PR #1](https://github.com/Startek-pvt-ltd/startek-restaurant-pos/pull/1). The candidate remains subject to incident closure and explicit merge approval. Staging uses synthetic data and access-controlled accounts.

## Module audit

| Approved module | Result | Evidence |
| --- | --- | --- |
| Authentication and authorization | PASS | Four role logins, protected-route denial, cashier export/report restrictions, logout, and deactivation revocation exercised in the browser suite. Expired and invalid JWTs covered by proxy tests. |
| Dashboard | PASS | Placeholder order, expense, activity, and best-seller lists replaced with bounded PostgreSQL queries. Empty dashboard and populated synthetic dashboard verified. |
| POS billing | PASS | Desktop checkout and mobile/tablet layout verified. Server pricing and subtotal-only behavior covered by unit and database checks. Concurrent retries used one checkout token and saved one order. |
| Payments | PASS | Synthetic cash, card and QR produced three paid rows with matching order totals and unique invoices. Recording tender does not authorize a charge or transfer. |
| Menu | PASS | Category and menu item creation exercised in the browser. Archival decisions tested for referenced and unreferenced items. |
| Orders | PASS | Unique invoices, order history, saved details and associated payments verified. Historical item-name snapshot migration is additive and leaves legacy rows intact. Cancellation and completion policies reviewed in the service. |
| Expenses | PASS | Synthetic expense creation and dashboard aggregation verified. Cashier deletion restrictions covered by tests and server role checks. |
| Staff | PASS | Staff creation exercised, all four roles signed in, and deactivation rejected an existing session. Role hierarchy and self-service password handling reviewed in the staff service. |
| Reports | PASS | Synthetic invoices found in the sales CSV and reports routes exercised. Calculations use the existing completed-order and payment filters. |
| Settings | PASS | Settings, profile and printer routes exercised. Mutations use Zod and service-level role checks. Logo uploads and hardware operations are disabled in cloud staging. |
| Receipts | PASS | Browser 80 mm layout, logo, quantity, paid total and stable item name after a rename verified. Footer duplication regression tested for browser and ESC/POS message handling. |
| Backup and recovery | PASS | Local app created a private dump, verified its SHA-256 checksum, and restored into a fresh database with three matching orders, payments and line items. A separate dump from synthetic Neon staging restored into another empty PostgreSQL database with seven matching orders and payments, three menu items, 22 recorded migrations at snapshot time, and no customer rows. |
| Data exports | PASS | Authorized order-item JSON retained the snapshot name, cashier export was denied, sales CSV contained the test invoices, and spreadsheet formula handling was unit tested. |

The matrix records evidence for the covered journeys. It is not an exhaustive enumeration of every input, browser, and management mutation. Dormant historical customer, table, kitchen, inventory and supplier models are retained for migration compatibility and are outside scope.

## Checks and portfolio assets

- Clean npm install, ESLint, TypeScript, 25 unit tests, Prisma validation, migration deploy and status on a disposable local database, and Netlify adapter build.
- Browser integration checks used disposable PostgreSQL and Chromium. Viewports included desktop, 820 px tablet, and 390 px mobile. POS and seven secondary routes were checked for mobile page overflow.
- [Case study](PORTFOLIO_CASE_STUDY.md), [screenshots](../README.md#demo-media), and [recorded walkthrough](portfolio/walkthrough.webm) use synthetic records. No public privileged account is provided.
- Netlify cloud build rejects local dotenv files. The function archive, Edge artifacts and static files are inspected before upload. Hosted staging remains access controlled.

## External gates

| Requirement | Result | Disposition |
| --- | --- | --- |
| Windows production credential comparison | BLOCKED | The live installation is outside this work. Comparison or coordinated remediation belongs to the incident owner. |
| Historical Netlify access and retention | BLOCKED | Removed artifacts are inaccessible. Provider evidence or the incident owner’s explicit disposition is still required. |
| Merge, release tag and customer cutover | BLOCKED | Explicit approval is required after incident closure. Existing tags remain intact. |
| Physical printer, cutter, drawer and failover | BLOCKED | Requires separate authorized hardware and operational acceptance. |

Use the published deploy record to locate the last known good staging version for rollback. The additive item-name column is compatible with the previous application.

## Automated CI and publication governance

The repository has a least-privilege GitHub Actions workflow in
`.github/workflows/ci.yml`. A green GitHub run at the **exact candidate
commit** is required before a release is considered independently verified;
local test results alone do not satisfy this condition. The workflow avoids
customer data and external staging credentials by running on synthetic
PostgreSQL data and disposable secrets.

Client name/brand publication remains subject to
[documented customer authorization](PORTFOLIO_PUBLICATION_APPROVAL.md).
Do not treat the publication checklist as permission already granted.

## Independent CI execution status (November 12, 2026)

The GitHub Actions workflow was installed and recognized by GitHub, but hosted
runner execution is currently **BLOCKED by GitHub account billing**. GitHub
reported: `The job was not started because your account is locked due to a
billing issue.` No Linux-hosted workflow job has passed. See
[the GitHub Actions diagnostic run](https://github.com/Startek-pvt-ltd/startek-restaurant-pos/actions/runs/43136840997).

In the meantime, a clean local clone passed ESLint, TypeScript, 25 unit tests,
Prisma schema validation, and the Netlify-compatible build against a synthetic
nonfunctional database address. An independent PostgreSQL 16 instance on a
private loopback port was seeded and migrated without touching any existing
restaurant database; the standalone Next.js server then passed the full
Playwright portfolio suite. Testing exposed and resolved an expense-dialog
initialization race; rerun passed expense entry, all four roles, all tender
methods, concurrent checkout replay, receipt history, exports and a private
backup. The isolated database and server were stopped after the test.

**Remaining release gates:** GitHub account owner unlocks Actions and obtains
a green workflow run; documented client branding permission; Windows production
secret comparison/rotation; Netlify historical artifact-access disposition;
and separate production hardware and cutover acceptance. No successful local
test is represented as a successful hosted CI run.
