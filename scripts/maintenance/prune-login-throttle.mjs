import pg from "pg";

const retentionDays = 30;
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
if ([...args].some((arg) => !["--apply", "--dry-run"].includes(arg))) {
  console.error("Usage: node scripts/maintenance/prune-login-throttle.mjs [--dry-run | --apply]");
  process.exit(2);
}
if (args.has("--dry-run") && apply) {
  console.error("Choose either --dry-run or --apply.");
  process.exit(2);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL must be supplied privately through a secret manager.");
  process.exit(2);
}
const address = new URL(url);
if (!["postgresql:", "postgres:"].includes(address.protocol)) {
  console.error("PostgreSQL connection required.");
  process.exit(2);
}
const database = decodeURIComponent(address.pathname.slice(1));
const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(address.hostname);

if (apply && process.env.POS_MAINTENANCE_CONFIRM_DATABASE !== database) {
  console.error("Refusing destructive cleanup without the exact database-name confirmation.");
  process.exit(2);
}
if (apply && !isLocal && process.env.POS_REMOTE_DB_MAINTENANCE_APPROVED !== "true") {
  console.error("Remote database maintenance requires separate explicit authorization.");
  process.exit(2);
}

const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  const query = [
    'FROM "AuthLoginThrottle"',
    "WHERE \"updatedAt\" < CURRENT_TIMESTAMP - INTERVAL '30 days'",
    'AND ("blockedUntil" IS NULL OR "blockedUntil" < CURRENT_TIMESTAMP)',
  ].join(" ");
  const count = await client.query("SELECT COUNT(*)::integer AS n " + query);
  const eligible = Number(count.rows[0]?.n ?? 0);
  if (!apply) {
    console.log(JSON.stringify({ mode: "dry-run", retentionDays, eligibleRows: eligible }));
  } else {
    const removed = await client.query("DELETE " + query);
    console.log(JSON.stringify({ mode: "applied", retentionDays, deletedRows: removed.rowCount }));
  }
} finally {
  await client.end();
}
