# Deployment

Apply checked-in migrations with `npx prisma migrate deploy` before starting the application. Persist `public/uploads/restaurant` or replace local logo storage with a configured durable object store before horizontally scaling. Never commit real authentication or database secrets.

The application does not communicate directly with USB/network printers. The workstation browser and operating-system print dialog must have access to Xprinter XP-80T. Use `/settings/printer` to confirm paper width, scale, margins, copies, and print behavior.
