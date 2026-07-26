# Startek Restaurant POS

Restaurant point-of-sale application for **Rice & Kottu Hut**, developed by **Startek (PVT) LTD**.

## Current release

TASK-009 stabilizes the existing authenticated application. The operational modules are:

- Dashboard (presentation-only mock metrics)
- POS Billing
- Menu Management, including categories
- Orders and order receipts
- Receipt printer Settings
- Reports, Expenses, and Staff placeholders
- Logout

Customer management, table management, kitchen display, inventory, suppliers, and marketplace-specific workflows are outside the approved product scope. Historical Prisma models remain in the schema so existing migrations and data are not destructively rewritten; see `docs/DATABASE.md`.

## Technology

- Next.js App Router, React, TypeScript, Tailwind CSS
- Auth.js credentials authentication and bcrypt
- Prisma ORM 7 with PostgreSQL
- Zod, React Hook Form, Zustand, Lucide React, Recharts, and Sonner
- npm and `package-lock.json` are the only supported package-manager workflow

## Local setup

1. Install Node.js 20.19 or newer and PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Replace `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` with environment-specific values. Never commit real secrets.
4. Run `npm install`.
5. Run `npm run prisma:generate`.
6. Apply migrations with `npm run prisma:migrate` in development or `npx prisma migrate deploy` in production.
7. Run `npm run prisma:seed` only when baseline seed data is required.
8. Start with `npm run dev` and open `http://localhost:3000`.

## Quality commands

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint validation |
| `npm run typecheck` | Strict TypeScript validation |
| `npm run build` | Production build |
| `npx prisma format` | Format the Prisma schema |
| `npx prisma validate` | Validate schema and configuration |
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npx prisma migrate status` | Compare checked-in migrations with the database |
| `npm run prisma:studio` | Open Prisma Studio |

## Receipt printing

Receipts target the **Xprinter XP-80T** using 80 mm paper and the browser/system print dialog. Select the installed printer, 80 mm paper, portrait orientation, zero margins, and disable browser headers and footers. The application does not communicate directly with USB/network printers and does not issue cash-drawer commands.

## Documentation

- `docs/PROJECT.md` — current scope and module behavior
- `docs/API.md` — Auth.js and Server Action boundaries
- `docs/DATABASE.md` — schema, transactions, and deferred cleanup
- `docs/UI_GUIDE.md` — navigation, responsive, and receipt rules
- `docs/QA_CHECKLIST.md` — executed and deferred QA checks
- `docs/BUG_FIX_REPORT.md` — stabilization findings and resolutions

## Branding

The interface uses gold `#F4B400`, dark brown `#4A2310`, cream `#FFF8E6`, white `#FFFFFF`, success green `#22C55E`, warning orange `#F97316`, and danger red `#EF4444`. The restaurant logo is stored at `public/logos/rice-kottu-hut-logo.png`.

## Settings

TASK-013 adds protected restaurant, billing, receipt, printer, system, and profile settings under `/settings`. Typed PostgreSQL fields are validated by Zod and enforced again inside server-side transactions. Uploaded restaurant logos are restricted to verified PNG, JPEG, or WebP files up to 2 MB.
