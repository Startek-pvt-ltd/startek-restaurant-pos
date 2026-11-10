import test from "node:test";
import assert from "node:assert/strict";
import { encode } from "next-auth/jwt";
import { NextRequest } from "next/server";

import { proxy } from "../src/proxy";

const secret = "staging-proxy-test-secret-" + "a".repeat(48);
const origin = "https://staging.example.netlify.app";
const cookie = "__Secure-authjs.session-token";

async function requestWithToken(
  pathname: string,
  sessionExpiresAt: number,
  options: { invalidSignature?: boolean } = {},
): Promise<NextRequest> {
  const signed = await encode({
    token: { sub: "mock-user-id", sessionExpiresAt },
    secret: options.invalidSignature ? "incorrect-" + secret : secret,
    salt: cookie,
  });
  return new NextRequest(new URL(pathname, origin), {
    headers: { cookie: `${cookie}=${encodeURIComponent(signed)}` },
  });
}

test("edge proxy rejects requests without a signed session", async () => {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = secret;
  try {
    const response = await proxy(new NextRequest(new URL("/dashboard?view=today", origin)));
    assert.equal(response.status, 307);
    const url = new URL(response.headers.get("location") ?? "");
    assert.equal(url.pathname, "/login");
    assert.equal(url.searchParams.get("callbackUrl"), "/dashboard?view=today");
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  }
});

test("edge proxy accepts a cryptographically valid, unexpired session token", async () => {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = secret;
  try {
    const request = await requestWithToken("/pos", Date.now() + 60_000);
    const response = await proxy(request);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  }
});

test("edge proxy rejects tampered or application-expired sessions", async () => {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = secret;
  try {
    const expired = await proxy(await requestWithToken("/orders", Date.now() - 1000));
    assert.equal(expired.status, 307);
    const invalid = await proxy(await requestWithToken("/reports", Date.now() + 60_000, { invalidSignature: true }));
    assert.equal(invalid.status, 307);
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  }
});

test("login page passes through for server-side revocation checking", async () => {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = secret;
  try {
    const response = await proxy(await requestWithToken("/login?error=access-disabled", Date.now() + 60_000));
    assert.equal(response.status, 200);
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  }
});
