import assert from "node:assert/strict";
import test from "node:test";

import { healthFailureEvent, newRequestId } from "../src/lib/operational-events";

test("health request ID is a UUID and changes between requests", () => {
  const first = newRequestId();
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(first, newRequestId());
});

test("health failure event only contains allowlisted, structured fields", () => {
  const event = JSON.parse(healthFailureEvent("1234", -2, new Date("2026-11-14T00:00:00Z")));
  assert.deepEqual(Object.keys(event).sort(), ["at", "durationMs", "event", "requestId", "service", "severity"].sort());
  assert.equal(event.durationMs, 0);
  assert.equal(event.severity, "error");
  assert.ok(!JSON.stringify(event).includes("DATABASE_URL"));
});
