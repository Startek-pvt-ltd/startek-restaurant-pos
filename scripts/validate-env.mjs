import { access } from "node:fs/promises";
import path from "node:path";

const required = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "BACKUP_DIR",
  "TRUSTED_ORIGIN",
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_APP_VERSION",
];

const errors = [];
for (const name of required) {
  if (!process.env[name]?.trim()) errors.push(`${name} is required.`);
}

function validateUrl(name, protocols) {
  const value = process.env[name]?.trim();
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (!protocols.includes(parsed.protocol)) errors.push(`${name} must use ${protocols.join(" or ")}.`);
    if (parsed.username || parsed.password) errors.push(`${name} must not contain URL credentials.`);
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    if (!["postgresql:", "postgres:"].includes(parsed.protocol)) errors.push("DATABASE_URL must use PostgreSQL.");
    if (!parsed.hostname || !parsed.pathname.slice(1)) errors.push("DATABASE_URL must include a database host and name.");
  } catch {
    errors.push("DATABASE_URL must be a valid PostgreSQL URL.");
  }
}

const authSecret = process.env.AUTH_SECRET?.trim() ?? "";
if (authSecret && (authSecret.length < 32 || /generate|replace|example|change/i.test(authSecret))) {
  errors.push("AUTH_SECRET must be a non-placeholder value of at least 32 characters.");
}

validateUrl("AUTH_URL", ["http:", "https:"]);
validateUrl("TRUSTED_ORIGIN", ["http:", "https:"]);

if (process.env.AUTH_URL && process.env.TRUSTED_ORIGIN) {
  try {
    if (new URL(process.env.AUTH_URL).origin !== new URL(process.env.TRUSTED_ORIGIN).origin) {
      errors.push("AUTH_URL and TRUSTED_ORIGIN must use the same origin for the local installation.");
    }
  } catch {
    // Individual URL validation above reports the actionable error.
  }
}

const backupDir = process.env.BACKUP_DIR?.trim();
if (backupDir) {
  const resolved = path.resolve(backupDir);
  const publicDir = path.resolve(process.cwd(), "public");
  if (resolved === publicDir || resolved.startsWith(`${publicDir}${path.sep}`)) {
    errors.push("BACKUP_DIR must be outside the public directory.");
  } else {
    try {
      await access(resolved);
    } catch {
      errors.push("BACKUP_DIR must already exist and be accessible.");
    }
  }
}

if (errors.length) {
  console.error("Production environment validation failed:");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("Production environment validation passed.");
