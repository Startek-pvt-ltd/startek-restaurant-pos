# Deployment

For the Rice & Kottu Hut MacBook installation, follow `docs/RICE_KOTTU_HUT_INSTALLATION.md`, complete `docs/RICE_KOTTU_HUT_UAT.md`, and record physical printer results in `docs/PRINTER_ACCEPTANCE_CHECKLIST.md`.

The supported local lifecycle commands are `./scripts/start-pos.sh`, `./scripts/health-check.sh`, and `./scripts/stop-pos.sh`. The default bind address is localhost only. LAN binding must be explicitly enabled and must never be exposed with router port forwarding.

Apply checked-in migrations with `npx prisma migrate deploy` before starting the application. Persist `public/uploads/restaurant` or replace local logo storage with a configured durable object store before horizontally scaling. Never commit real authentication or database secrets.

Printer access depends on the selected mode. **Browser** mode uses the workstation browser, Windows print dialog, and installed Xprinter XP-80T driver; cutter behavior comes from the driver and this mode cannot pulse the cash drawer. **Direct ESC/POS bridge** mode sends authenticated jobs to the loopback-only bridge, which communicates with a network-accessible ESC/POS printer over raw TCP port 9100 and can issue drawer and cutter commands. USB-only direct printing requires a supported network print interface and is not provided by the bridge. Follow `docs/windows-thermal-printer.md` and confirm the selected mode in `/settings/printer`.

## Private backups

Set `BACKUP_DIR` to an existing writable directory outside `public/`, preferably outside the application release directory. Install PostgreSQL client tools matching or newer than the server. Optional `PG_DUMP_PATH` and `PG_RESTORE_PATH` values may identify executables when they are not on `PATH`; never include arguments or credentials. Persist, encrypt, permission-restrict, monitor, and separately replicate this directory at the infrastructure layer.

## Netlify deployment packaging (critical)

The Next.js Netlify adapter produces deployable static assets in
`.netlify/static/`, a serverless handler in `.netlify/functions-internal/`,
and Edge middleware. **Do not manually deploy `.next` as the publish directory.**
Doing so can leave login HTML accessible while its CSS, JavaScript and
`/logos/rice-kottu-hut-logo.png` return HTTP 404, creating a completely
unstyled login page.

From a clean Git checkout **without local `.env` files**, configure
environment variables privately through Netlify. Build the Next.js adapter
using Netlify CLI and the approved deployment configuration:

```bash
npm ci
netlify build --offline --context production
export NETLIFY_SITE_ID="323bf7b1-a1f8-4fba-902a-d6d31c1a63b8"
bash scripts/deploy-netlify.sh production
node scripts/smoke-netlify.mjs https://startek-restaurant-pos.netlify.app
```

The deployment helper verifies that the restaurant logo, at least one
stylesheet, serverless handler and generated static files exist and refuses
local dotenv files. Its `preview` mode uses Netlify's deploy-preview context,
which may need its own configured, isolated database credentials. Never point
preview builds at customer production data.

The script's `production` flag publishes to the **main URL of the selected
Netlify site**; it does **not** mean customer production data or Windows
hardware have been commissioned. The existing site intentionally runs a
synthetic-data PostgreSQL environment for demonstrations.

After deployment, verify HTTP 200 and correct content types for the exact
stylesheet and logo paths referenced by the HTML; verify database health,
anonymous route protection, and missing private-file paths. Retain the prior
Netlify deployment ID as a rollback candidate.

Never change or reseed the customer's local Windows database during the
Netlify packaging process.
