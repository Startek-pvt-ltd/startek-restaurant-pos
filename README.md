# Startek Restaurant POS

A restaurant point-of-sale application developed by **Startek (PVT) LTD** for **Rice & Kottu Hut**. It connects order entry, payments, receipts, menu administration, and operating reports in one workspace.

The portfolio release is a **v1.0.0 candidate**. The Netlify site runs against isolated synthetic data and requires sign-in. Public reviewers can use the screenshots and walkthrough without an account. [Staging](https://startek-pos-original-staging.netlify.app/login) · [Portfolio case study](docs/PORTFOLIO_CASE_STUDY.md) · [Release verification](docs/PORTFOLIO_RELEASE.md)

## Features

| Area | What the application provides |
| --- | --- |
| Authentication | Username or email sign-in, four approved roles, expiring sessions, and server-side revocation on account deactivation |
| Dashboard | Database-backed sales, order and expense totals, payment mix, recent activity, and best sellers |
| POS and payments | Dine-in, takeaway and delivery carts with item variants, server-priced checkout, and recorded cash, card or QR tender |
| Menu and orders | Categories, item prices and availability, archival for referenced items, invoice search, order detail and cancellation |
| Expenses and staff | Expense recording and filters, staff roles, account status, password management and personal profiles |
| Reports and exports | Sales, item, payment, cashier and expense views, CSV and Excel report exports, and role-controlled business extracts in CSV, Excel or JSON |
| Receipts | 80 mm browser receipts with stored order and payment amounts. New lines retain the checkout-time item name |
| Settings and recovery | Restaurant, billing, receipt and printer preferences. Private PostgreSQL dumps on local installations and an operator-managed recovery workflow for cloud staging |

Card and QR record the selected tender. The app does not process card details or verify external transfers. Customer management, tables, kitchen display, inventory, suppliers and marketplace integrations are outside the release scope.

## Demo media

Captured from the running application with synthetic records.

![Desktop dashboard with synthetic sales and expenses](docs/portfolio/dashboard-desktop.jpg)

[Tablet POS](docs/portfolio/pos-tablet.jpg) · [Mobile POS](docs/portfolio/pos-mobile.jpg) · [80 mm receipt](docs/portfolio/receipt-desktop.jpg) · [Recorded walkthrough](docs/portfolio/walkthrough.webm) · [Written walkthrough](docs/PORTFOLIO_WALKTHROUGH.md)

## Architecture

Next.js App Router, React, TypeScript and Tailwind CSS render the interface. Auth.js uses credentials verified with bcrypt. The request proxy checks signed session tokens and protected server operations verify account state, session version and role in PostgreSQL. Zod validates inputs and Prisma runs checkout in a transaction that writes the order, lines, payment and audit record. A unique checkout token makes retries safe. Netlify uses its Next.js adapter with an Edge Function and Node.js handler backed by pooled Neon PostgreSQL.

## Local setup

1. Use Node.js 22, npm, and PostgreSQL. For backups, install `pg_dump` and `pg_restore` at least as new as the server.
2. Copy `.env.example` to an ignored `.env`. Point it to a development database and use an installation-specific auth secret.
3. Run `npm ci`, `npm run prisma:generate`, and `npx prisma migrate deploy`.
4. For a fresh disposable demo database, supply `SEED_SUPER_ADMIN_PASSWORD` privately and run `npm run prisma:seed`.
5. Run `npm run dev` and open [the local app](http://localhost:3000).

| Environment variable names | Purpose |
| --- | --- |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Runtime PostgreSQL connection and optional direct migration connection |
| `AUTH_SECRET`, `AUTH_URL`, `TRUSTED_ORIGIN` | Signing secret and application origin configuration |
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_VERSION` | Public application metadata |
| `SEED_SUPER_ADMIN_PASSWORD` | Initial password for a new database only |
| `BACKUP_DIR`, `PG_DUMP_PATH`, `PG_RESTORE_PATH` | Private local backup storage and optional client tool locations |
| `POS_DEPLOYMENT`, `POS_HOST`, `POS_PORT` | Deployment and local bind configuration |
| `PRINTER_BRIDGE_URL`, `PRINTER_BRIDGE_TOKEN`, `ESC_POS_PRINTER_HOST` | Optional local Windows printer bridge |

## Verification and deployment

```sh
npm run lint
npm run typecheck
npm test
npx prisma validate
npx prisma migrate status
```

The browser suite uses a fresh disposable PostgreSQL database named `startek_portfolio_<hex>`. Start the app on localhost port 3107 with that database and private seed credentials. Install Chromium with `npx playwright install chromium` and run `npm run test:e2e` with the same database, auth URL, and seed password in the environment. Use a private backup directory. The suite writes synthetic users, expenses, orders and a database dump. Do not point it at an existing installation. Set `PORTFOLIO_MEDIA_DIR` to capture demo screenshots.

Netlify uses `npm run build:netlify` from a clean checkout. Supply secrets through Netlify environment settings. The build rejects local dotenv files. Use the pooled Neon connection for runtime and apply checked-in migrations separately through the direct connection. Review the package for secrets and keep the last known good deploy available. See [deployment](docs/DEPLOYMENT.md), [database design](docs/DATABASE.md), and [backup and recovery](docs/BACKUP_RESTORE_GUIDE.md).

## Security and known limits

- Cloud deployments disable local filesystem backups and restores, local logo uploads, automatic printing, and direct hardware commands. Browser receipt rendering remains available.
- Older order lines without item-name snapshots fall back to the associated menu name. The migration leaves historic rows and totals intact.
- Physical Windows printing, cutting, cash drawer and live failover require separate acceptance. This repository does not claim live restaurant commissioning.
- The PR remains subject to external incident closure and explicit merge approval. No privileged credentials are published with the portfolio.

## GitHub Actions continuous integration

Every pull request to `main` and every release-branch push runs
[POS Quality and Portfolio Release](.github/workflows/ci.yml), comprising:

- **Quality:** npm clean install, Prisma code generation and schema validation,
  ESLint, TypeScript, unit tests, and tracked secret/dump filename safeguards.
- **Cloud build:** Next.js Netlify-compatible build using an intentionally
  nonfunctional database URL and a disposable signing secret. The build fails
  if local dotenv files are present in its standalone output.
- **Browser integration:** isolated PostgreSQL service, fresh migrations and
  synthetic seed, standalone Node server, Playwright Chromium tests for role
  permissions, checkout methods, duplicate-payment protection, receipts,
  exports and local backup creation.

The CI pipeline needs **no Netlify token, Neon connection, customer data, or
production secrets**. A passed local test is not represented as a GitHub
Actions result: inspect the workflow run for the specific release commit.
See [release verification](docs/PORTFOLIO_RELEASE.md).

## Portfolio publication and customer approval

Screenshots and the walkthrough contain synthetic records. Presenting the
named client and its branding in a public **personal** portfolio requires
recorded client authorization; see
[portfolio publication authorization](docs/PORTFOLIO_PUBLICATION_APPROVAL.md).
Until approved, use an anonymized public description and do not imply the
client endorses this release. No production Windows hardware acceptance or
customer cutover is claimed.
