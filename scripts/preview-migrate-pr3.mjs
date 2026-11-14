import { spawnSync } from "node:child_process";

const EXPECTED = Object.freeze({
  netlifySiteId: "323bf7b1-a1f8-4fba-902a-d6d31c1a63b8",
  previewNumber: "3",
  dbHost: "ep-noisy-morning-a134ewaf-pooler.ap-southeast-1.aws.neon.tech",
  dbName: "startek_pos_preview",
  dbUser: "preview_app",
  origin: "https://deploy-preview-3--startek-restaurant-pos.netlify.app",
});
const violations = [];

if (process.env.NETLIFY !== "true") violations.push("Not running on Netlify.");
if (process.env.CONTEXT !== "deploy-preview") violations.push("Not a Deploy Preview build.");
if (process.env.REVIEW_ID !== EXPECTED.previewNumber) violations.push("Not PR #3.");
if (process.env.PULL_REQUEST !== "true") violations.push("Not an eligible pull request.");
if (process.env.SITE_ID !== EXPECTED.netlifySiteId) violations.push("Unexpected Netlify project.");

try {
  const url = new URL(process.env.DATABASE_URL || "");
  if (!["postgresql:", "postgres:"].includes(url.protocol)) violations.push("Not PostgreSQL.");
  if (url.hostname !== EXPECTED.dbHost) violations.push("Database host is not the isolated PR preview Neon project.");
  if (url.pathname !== "/" + EXPECTED.dbName) violations.push("Database name does not match isolated PR preview database.");
  if (decodeURIComponent(url.username) !== EXPECTED.dbUser) violations.push("Database user is not preview_app.");
  if (!url.password) violations.push("Database password is missing.");
  if (!["require", "verify-full"].includes(url.searchParams.get("sslmode"))) violations.push("TLS is required.");
} catch {
  violations.push("Preview database connection URL is missing or invalid.");
}

if ((process.env.AUTH_SECRET || "").length < 32) violations.push("Preview AUTH_SECRET is unavailable.");
for (const key of ["AUTH_URL", "TRUSTED_ORIGIN"]) {
  if (process.env[key] !== EXPECTED.origin) violations.push(key + " does not match the PR #3 origin.");
}

if (violations.length) {
  // Never print environment values, passwords, database URIs, or signing secrets.
  console.error("PREVIEW SAFETY GATE FAILED: Migration aborted.");
  for (const reason of violations) console.error("- " + reason);
  process.exit(1);
}

console.log("PREVIEW SAFETY GATE PASSED: Applying Prisma migrations to isolated PR #3 database only.");
const result = spawnSync("node_modules/.bin/prisma", ["migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  timeout: 150000,
});
if (result.error) console.error("Preview migration process did not start.");
process.exit(result.status ?? 1);
