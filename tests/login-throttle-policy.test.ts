import assert from "node:assert/strict";
import test from "node:test";

import {
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_ATTEMPT_WINDOW_MINUTES,
  LOGIN_BLOCK_MINUTES,
  loginThrottleKey,
  normalizeLoginIdentifier,
} from "../src/features/auth/login-throttle-policy";

const secret = "a".repeat(48);

test("normalizes identifiers for account-based throttling", () => {
  assert.equal(normalizeLoginIdentifier("  Admin@Example.COM  "), "admin@example.com");
  assert.equal(loginThrottleKey("ADMIN@EXAMPLE.COM", secret), loginThrottleKey(" admin@example.com ", secret));
});

test("throttle keys do not reveal identifiers and are scoped by secret", () => {
  const key = loginThrottleKey("customer@example.com", secret);
  assert.match(key, /^[0-9a-f]{64}$/);
  assert.ok(!key.includes("customer"));
  assert.notEqual(key, loginThrottleKey("customer@example.com", "b".repeat(48)));
  assert.notEqual(key, loginThrottleKey("other@example.com", secret));
});

test("rejects weak or missing throttle key material", () => {
  assert.throws(() => loginThrottleKey("admin", ""), /configured signing secret/);
  assert.throws(() => loginThrottleKey("admin", "short"), /configured signing secret/);
});

test("lockout parameters are within documented operational limits", () => {
  assert.equal(LOGIN_ATTEMPT_LIMIT, 8);
  assert.equal(LOGIN_ATTEMPT_WINDOW_MINUTES, 15);
  assert.equal(LOGIN_BLOCK_MINUTES, 10);
});
