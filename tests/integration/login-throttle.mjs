import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";

// This test MUST run only on a disposable PostgreSQL database after migrations.
if (process.env.POS_TEST_DATABASE !== "true") {
  console.error("Set POS_TEST_DATABASE=true only for a disposable CI database.");
  process.exit(2);
}
const uri = new URL(process.env.DATABASE_URL || "");
if (!["localhost", "127.0.0.1"].includes(uri.hostname) ||
    !/^(startek_phase2_|startek_portfolio_)/.test(uri.pathname.slice(1))) {
  throw new Error("Refusing to test login throttling outside an isolated local CI database.");
}

const source = readFileSync(new URL("../../src/features/auth/login-rate-limit.ts", import.meta.url), "utf8");
const bt = String.fromCharCode(96);
const open = source.indexOf("$queryRaw<ThrottleState[]>" + bt);
assert.ok(open !== -1, "Expected tagged atomic login throttle SQL");
const start = open + ("$queryRaw<ThrottleState[]>" + bt).length;
const end = source.indexOf(bt, start);
const sql = source.slice(start, end).replace("$" + "{keyHash}", "$1");
assert.ok(sql.includes('ON CONFLICT ("keyHash") DO UPDATE SET'));

const key = createHmac("sha256", "ci-test-only-secret".padEnd(48, "x"))
  .update("pos:auth:login:v1:")
  .update("test-" + randomUUID())
  .digest("hex");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const records = [];
  for (let attempt = 1; attempt <= 9; attempt++) {
    const result = await client.query(sql, [key]);
    assert.equal(result.rowCount, 1);
    records.push(result.rows[0].blockedUntil);
  }
  assert.ok(records.slice(0, 7).every((value) => value === null),
    "The first seven attempts must not block the account");
  assert.ok(records[7] instanceof Date, "Eighth attempt must block");
  assert.equal(records[8].getTime(), records[7].getTime(),
    "Additional attempts must not extend the original lockout");
  // Expired window resets the counter rather than permanently locking an ID.
  await client.query(
    'UPDATE "AuthLoginThrottle" SET "windowStartedAt" = CURRENT_TIMESTAMP - INTERVAL \'16 minutes\', "blockedUntil" = NULL WHERE "keyHash" = $1',
    [key],
  );
  const afterWindow = await client.query(sql, [key]);
  assert.equal(afterWindow.rows[0].blockedUntil, null);
  const restarted = await client.query(
    'SELECT "attemptCount" FROM "AuthLoginThrottle" WHERE "keyHash" = $1', [key],
  );
  assert.equal(restarted.rows[0].attemptCount, 1);
  // Concurrent attempts from distinct connections must be serialized by PostgreSQL.
  const concurrentKey = createHmac("sha256", "ci-test-only-secret".padEnd(48, "x"))
    .update("pos:auth:login:v1:concurrent-")
    .update(randomUUID())
    .digest("hex");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 8 });
  try {
    await Promise.all(Array.from({ length: 8 }, () => pool.query(sql, [concurrentKey])));
    const status = await client.query(
      'SELECT "attemptCount", "blockedUntil" FROM "AuthLoginThrottle" WHERE "keyHash" = $1',
      [concurrentKey],
    );
    assert.equal(status.rows[0].attemptCount, 8);
    assert.ok(status.rows[0].blockedUntil instanceof Date);
  } finally {
    await pool.end();
    await client.query('DELETE FROM "AuthLoginThrottle" WHERE "keyHash" = $1', [concurrentKey]);
  }
  console.log("Disposable PostgreSQL throttle: block threshold, window reset and 8 concurrent attempts passed.");
} finally {
  await client.query('DELETE FROM "AuthLoginThrottle" WHERE "keyHash" = $1', [key]);
  await client.end();
}
