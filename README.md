# Startek Restaurant POS

**Restaurant point-of-sale and back-office management, developed by Startek (PVT) LTD.**

A full-stack system built for a restaurant engagement, bringing order entry, recorded payments, menu administration, staff access, expenses, reporting and thermal receipts into one application. The codebase supports a local workstation deployment and a separately configured cloud evaluation environment.

[View case study](docs/PORTFOLIO_CASE_STUDY.md) · [Browse demo media](docs/portfolio/README.md) · [Architecture](docs/ARCHITECTURE.md) · [Release evidence](docs/PORTFOLIO_RELEASE.md)

> **Deployment status:** v1.0.0 portfolio release candidate. The [Netlify evaluation site](https://startek-restaurant-pos.netlify.app/login) uses synthetic data and requires authentication. This is not a claim of customer production cutover. No public administrator credentials are provided.

## Product preview

![Restaurant POS dashboard with synthetic sales and expense data](docs/portfolio/dashboard-desktop.jpg)

### Cashier workspace

![Desktop point-of-sale checkout](docs/portfolio/pos-desktop.jpg)

| Tablet POS | Mobile POS |
| :---: | :---: |
| ![Tablet point of sale](docs/portfolio/pos-tablet.jpg) | ![Mobile point of sale](docs/portfolio/pos-mobile.jpg) |

[Order history](docs/portfolio/orders-desktop.jpg) · [Financial reports](docs/portfolio/reports-desktop.jpg) · [80 mm receipt preview](docs/portfolio/receipt-desktop.jpg) · [Recorded walkthrough](docs/portfolio/walkthrough.webm) · [Step-by-step walkthrough](docs/PORTFOLIO_WALKTHROUGH.md)

All screenshots and transactions shown in these assets use demonstration data.

## Capabilities

| Module | Implementation |
| --- | --- |
| **POS and orders** | Dine-in, takeaway and delivery; size/variant selection; server-priced checkout; order history, cancellation and invoice search |
| **Payment records** | Cash, card and QR tender selection, totals reconciliation and duplicate-submission protection |
| **Menu** | Category and product management, prices, availability and history-safe archival |
| **Dashboard** | Database-backed sales, payment mix, activity, expenses and best-seller summaries |
| **Reporting** | Sales, menu items, payments, cashiers and expenses; filtered CSV/Excel exports |
| **Staff and access** | Super Admin, Owner, Manager and Cashier roles; account management, activity records and session revocation |
| **Expenses** | Expense categories, access-controlled edits, filters, totals and audit history |
| **Receipts** | 80 mm browser-print layouts with stored invoice amounts and historical item-name snapshots |
| **Settings and recovery** | Restaurant, billing, receipt and printer preferences; private local PostgreSQL backups and documented recovery procedures |

**Payment boundary:** Card and QR are *recorded tender methods*, not card processing or bank-transfer verification. This application does not store card details or initiate transfers.

Customer profiles, table assignment, kitchen displays, inventory, supplier management and delivery marketplace integrations are outside the approved scope of this release.

## Technical architecture

| Layer | Technology |
| --- | --- |
| Interface | Next.js App Router, React 19, TypeScript, Tailwind CSS |
| Identity and authorization | Auth.js credentials, bcrypt, signed sessions and database-backed role/status checks |
| Backend | Next.js server components, server actions, Zod validation |
| Persistence | PostgreSQL, Prisma 7, transactional writes and unique checkout tokens |
| Cloud evaluation | Netlify Next.js runtime, Edge proxy, serverless handler and pooled Neon PostgreSQL |
| Workstation peripherals | 80 mm browser printing; optional authenticated local ESC/POS bridge |

```mermaid
flowchart LR
    A[Cashier or manager] --> B[Next.js UI]
    B --> C[Authenticated server actions]
    C --> D[Validation and access control]
    D --> E[Prisma transactions]
    E --> F[(PostgreSQL)]
    C --> G[Receipt rendering]
    G --> H[Browser printer or approved local bridge]
```

See [Architecture and decisions](docs/ARCHITECTURE.md) for the trust boundaries, transaction guarantees and differences between cloud and local operation.

## Run locally

**Prerequisites:** Node.js 22, npm and PostgreSQL. PostgreSQL client utilities (`pg_dump`, `pg_restore`) are required for local database backups.

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/Startek-pvt-ltd/startek-restaurant-pos.git
   cd startek-restaurant-pos
   npm ci
   ```
2. Create a private local environment file from `.env.example`. Set a development `DATABASE_URL`, strong unique `AUTH_SECRET`, localhost `AUTH_URL` and `TRUSTED_ORIGIN`. Never use a customer database or production secret for development.
3. Generate Prisma and apply migrations to the **intended development database**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. Optionally seed **only a newly created disposable database** with a private `SEED_SUPER_ADMIN_PASSWORD`:
   ```bash
   npm run prisma:seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000`. See [Setup](docs/SETUP.md) and [Database](docs/DATABASE.md) for installation and migration details. Seeding must never run against an existing restaurant database.

### Main environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Pooled runtime database connection; optional direct migration connection |
| `AUTH_SECRET`, `AUTH_URL`, `TRUSTED_ORIGIN` | Session signing and trusted application origin |
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_VERSION` | Public application metadata |
| `SEED_SUPER_ADMIN_PASSWORD` | Initial credentials for a **new disposable** installation |
| `BACKUP_DIR` | Private workstation backup directory, outside the public web root |
| `POS_DEPLOYMENT` | Cloud/local behavior policy |
| `PRINTER_BRIDGE_URL`, `PRINTER_BRIDGE_TOKEN` | Optional local printer bridge; never expose across the public internet |

For the complete configuration and printer setup, use the [operations documentation](docs/README.md).

## Test and release process

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npx prisma migrate status
```

The browser suite (`npm run test:e2e`) requires a **fresh isolated** PostgreSQL database named `startek_portfolio_<hex>`, synthetic seed credentials, a private backup directory and a local application server. It performs actual writes and must never target a customer database. See [Release verification](docs/PORTFOLIO_RELEASE.md) for the tested scenarios and recorded results.

[GitHub Actions workflow](.github/workflows/ci.yml) defines quality, cloud-build and disposable-database browser checks. Its latest hosted execution is **blocked by a GitHub account billing restriction**; local verification does not count as a successful hosted CI run.

A Netlify deployment must be built from a clean checkout with credentials supplied as platform environment variables. The cloud build rejects local dotenv files. Apply migrations deliberately and inspect the generated functions before uploading. See [Deployment](docs/DEPLOYMENT.md).

## Operating boundaries

- Cloud evaluation disables local filesystem backup/restore, local logo uploads, unattended printing, cash-drawer activation and direct printer bridge commands.
- Local printer, cutter and drawer support requires on-site acceptance and appropriate Windows/ESC-POS setup.
- A prior staging artifact exposure was remediated; historical provider access/retention and Windows credential-reuse disposition remain external security gates.
- The GitHub release branch is pending formal approval. The staging deployment is **not** a customer-production commissioning certificate.
- Portfolio use of customer-identifiable branding requires appropriate client authorization. No customer sales records or privileged demo credentials are published.

## Documentation

Start with the [documentation index](docs/README.md). Key references include the [architecture](docs/ARCHITECTURE.md), [portfolio case study](docs/PORTFOLIO_CASE_STUDY.md), [verification matrix](docs/PORTFOLIO_RELEASE.md), [printer acceptance checklist](docs/PRINTER_ACCEPTANCE_CHECKLIST.md), [backup procedure](docs/BACKUP_RESTORE_GUIDE.md) and [security policy](SECURITY.md).

---

Maintained by **Startek (PVT) LTD**. The repository documents a real software implementation and its demonstrated behavior; no claims are made about unverified customer outcomes or physical production acceptance.
