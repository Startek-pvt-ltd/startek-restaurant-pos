# Rice & Kottu Hut Local Installation

This deployment is designed for the restaurant MacBook Pro M2. It runs as a local Node.js application backed by PostgreSQL and is not intended to be exposed directly to the public internet.

## Production requirements

- macOS with Apple Silicon
- Node.js 22 LTS and npm
- PostgreSQL server and PostgreSQL client tools (`pg_dump`, `pg_restore`)
- Google Chrome or another supported browser
- Xprinter XP-80T installed in macOS
- A private, writable backup directory outside the project `public` folder
- The project root `.env`, readable only by the installation account

Copy `.env.example` to `.env`, then replace every placeholder. Required values are `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `BACKUP_DIR`, `TRUSTED_ORIGIN`, `NEXT_PUBLIC_APP_NAME`, and `NEXT_PUBLIC_APP_VERSION`. For workstation-only use:

```text
AUTH_URL=http://localhost:3000
TRUSTED_ORIGIN=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Startek Restaurant POS
NEXT_PUBLIC_APP_VERSION=1.0.0
POS_HOST=127.0.0.1
POS_PORT=3000
```

Generate `AUTH_SECRET` using a secure random generator. Never copy a sample secret into production or commit `.env`.

## Start, stop, and health

From Terminal in the project directory:

```bash
./scripts/start-pos.sh
./scripts/health-check.sh
./scripts/stop-pos.sh
```

Startup validates configuration, runs `npm ci`, generates Prisma Client, applies checked-in production migrations, builds the application, and starts it on `http://localhost:3000`. Runtime PID and logs are stored privately in `.pos-runtime/`.

To restart, stop first and run the start command again. After a Mac reboot, start PostgreSQL before running `start-pos.sh`. An administrator may add the start script to a macOS Login Item or a user LaunchAgent only after confirming the absolute project path and installation account. Do not configure automatic startup until an attended start/stop test passes.

## PostgreSQL startup

If PostgreSQL was installed with Homebrew, verify its service with `brew services list`. The exact service name depends on the installed PostgreSQL version. The POS health check must not be considered healthy until its database status is `connected`.

Never use `prisma migrate reset` on the restaurant database. Never run the seed as part of normal production startup. The seed now preserves existing restaurant, settings, staff, category, and menu records, but remains a new-installation tool only.

## Optional restaurant LAN access

Workstation-only mode (`POS_HOST=127.0.0.1`) is safest. To allow a trusted device on the same private restaurant network:

1. Give the Mac a stable private LAN address.
2. Set `POS_HOST=0.0.0.0`.
3. Set `AUTH_URL` and `TRUSTED_ORIGIN` to the exact private address used by devices, such as `http://192.168.1.20:3000`.
4. Allow incoming TCP port 3000 for Node only on the private network in macOS Firewall.
5. Restart the POS and test authentication from the device.

Do not configure router port forwarding, public DNS, UPnP exposure, or a public tunnel. Use a professionally configured VPN if remote support is ever required.

## Verified restaurant defaults

- Rice & Kottu Hut
- No.32, Padukka Road, Meegoda
- 0777250493 / 0778375427
- LKR / `Rs.`
- Xprinter XP-80T, 80 mm, 100% scale, no margins
- Dine-In, Takeaway, Delivery
- Cash, Card, QR
- Discount, tax, and service charge disabled and stored as zero on new orders
- Grand total equals subtotal for new orders

## Daily workflow

### Opening

1. Start the MacBook and sign in to the installation account.
2. Confirm PostgreSQL is running.
3. Run `./scripts/start-pos.sh`.
4. Run `./scripts/health-check.sh`.
5. Log in with your own account.
6. Open the cash session when the Cash Closing module is present on the deployed branch.
7. Check the printer and process one approved test receipt.

### During business

1. Create orders and select Dine-In, Takeaway, or Delivery.
2. Select Cash, Card, or QR.
3. Print the receipt and confirm the total before serving the customer.
4. Record expenses with the correct payment method.
5. Review notifications and order history when needed.

### Closing

1. Stop taking orders.
2. Close the cash session and verify the difference when Cash Closing is available.
3. Print the closing summary.
4. Create and verify a database backup.
5. Log out.
6. Run `./scripts/stop-pos.sh` before shutting down the Mac.

## Installation blockers

The current `deployment/rice-kottu-hut` branch does not contain TASK-016 Cash Closing routes, service, or migration. It must be merged and revalidated before live installation. Real OWNER and MANAGER accounts also require the restaurant-provided names, unique usernames, and privately chosen strong passwords.
