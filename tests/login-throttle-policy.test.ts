import assert from "node:assert/strict";
import test from "node:test";

import {
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_ATTEMPT_WINDOW_MINUTES,
  LOGIN_BLOCK_MINUTES,
  CLIENT_IP_ATTEMPT_LIMIT,
  clientIpThrottleKey,
  loginThrottleKey,
  normalizeLoginIdentifier,
  trustedNetlifyClientIp,
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


test("canonical account UUIDs share a throttle key regardless of login alias", () => {
  const canonicalAccount = "user:97e905f1-8749-4c16-9529-b4ef76419672";
  assert.equal(loginThrottleKey(canonicalAccount, secret), loginThrottleKey(canonicalAccount.toUpperCase(), secret));
  assert.notEqual(loginThrottleKey(canonicalAccount, secret), loginThrottleKey("unknown:admin@example.com", secret));
});

test("trusted Netlify IP is validated and never comes from X-Forwarded-For", () => {
  const forged = new Request("https://pos.example.invalid/login", {
    headers: { "x-forwarded-for": "9.9.9.9", "x-nf-client-connection-ip": "203.0.113.5" },
  });
  assert.equal(trustedNetlifyClientIp(forged, false), null);
  assert.equal(trustedNetlifyClientIp(forged, true), "203.0.113.5");

  const noNetlifyHeader = new Request("https://pos.example.invalid/login", {
    headers: { "x-forwarded-for": "9.9.9.9" },
  });
  assert.equal(trustedNetlifyClientIp(noNetlifyHeader, true), null);
  const malformed = new Request("https://pos.example.invalid/login", {
    headers: { "x-nf-client-connection-ip": "203.0.113.5, 9.9.9.9" },
  });
  assert.equal(trustedNetlifyClientIp(malformed, true), null);
});

test("IP hashing is scoped and never stores the raw address", () => {
  assert.equal(CLIENT_IP_ATTEMPT_LIMIT, 100);
  const ipKey = clientIpThrottleKey("203.0.113.5", secret);
  assert.match(ipKey, /^[a-f0-9]{64}$/);
  assert.ok(!ipKey.includes("203.0.113.5"));
  assert.notEqual(ipKey, loginThrottleKey("203.0.113.5", secret));
  assert.throws(() => clientIpThrottleKey("invalid IP", secret), /Invalid client IP/);
});
