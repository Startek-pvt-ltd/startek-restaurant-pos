# Local setup

Configure `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` in an uncommitted `.env`, then run `npm install`, `npx prisma migrate deploy`, `npm run prisma:generate`, and `npm run dev`.

Restaurant logo uploads are written to `public/uploads/restaurant`. The runtime user must have write access to that directory. Only verified PNG, JPEG, and WebP files up to 2 MB are accepted.

Printer configuration remains in the operating system: install Xprinter XP-80T, select 80 mm paper, disable browser headers/footers, and select it in the browser print dialog.
