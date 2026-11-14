import test from "node:test";
import assert from "node:assert/strict";

import { SECURITY_HEADERS } from "../src/lib/security-headers";
import nextConfig from "../next.config";

test("central security headers prevent framing, plugins, referrer leaks and sniffing", () => {
  const headers = Object.fromEntries(SECURITY_HEADERS.map(({ key, value }) => [key.toLowerCase(), value]));
  assert.equal(headers["x-frame-options"], "DENY");
  assert.match(headers["content-security-policy"] ?? "", /frame-ancestors 'none'/);
  assert.match(headers["content-security-policy"] ?? "", /object-src 'none'/);
  assert.match(headers["content-security-policy"] ?? "", /base-uri 'self'/);
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["referrer-policy"], "strict-origin-when-cross-origin");
  assert.match(headers["permissions-policy"] ?? "", /camera=\(\)/);
});

test("Next.js applies security headers to every request path", async () => {
  assert.equal(typeof nextConfig.headers, "function");
  const result = await nextConfig.headers?.();
  assert.equal(result?.length, 1);
  assert.equal(result[0]?.source, "/:path*");
  assert.ok(result[0]?.headers?.some((h) => h.key === "X-Frame-Options"));
});
