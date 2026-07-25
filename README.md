# Startek Restaurant POS

A production-ready foundation for the Rice & Kottu Hut restaurant point-of-sale system. This release establishes the application architecture, branded interface, PostgreSQL connectivity, and development tooling. Business modules are reserved for later phases.

## Client

**Rice & Kottu Hut**  
No.32, Padukka Road, Meegoda  
0777250493 / 0778375427

## Developer

Developed by **Startek (PVT) LTD**. Receipts must display: **Design & Deploy by Startek (PVT) LTD**.

## Technology stack

- Next.js App Router, React, TypeScript, Tailwind CSS, and ESLint
- Prisma ORM with PostgreSQL
- shadcn/ui, Lucide React, and Sonner
- Zod, React Hook Form, and Zustand
- Recharts, date-fns, and react-to-print

## Installation

1. Install Node.js 20.19 or newer and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `AUTH_SECRET`.
3. Run `npm install`.
4. Run `npm run prisma:generate`.
5. Run `npm run dev` and open `http://localhost:3000`.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run strict TypeScript checks |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create and apply a development migration |
| `npm run prisma:studio` | Open Prisma Studio |

## Project structure

```text
src/
  app/                 App Router routes and global styling
  components/          Layout, shared, and shadcn/ui components
  features/            Feature-owned modules
  hooks/               Shared React hooks
  lib/                 Framework and database utilities
  services/            Application service layer
  types/               Shared TypeScript types
  utils/               General utility functions
  validations/         Zod schemas
prisma/                Prisma schema
docs/                  Product and engineering documentation
public/                Logos, menu imagery, and receipt assets
```

## Branding

The interface uses gold `#F4B400`, dark brown `#4A2310`, cream `#FFF8E6`, white `#FFFFFF`, success green `#22C55E`, and error red `#EF4444`. The supplied logo is preserved at `public/logos/rice-kottu-hut-logo.png`.
