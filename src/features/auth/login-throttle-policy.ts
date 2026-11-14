import { createHmac } from "node:crypto";
import { isIP } from "node:net";

export const LOGIN_ATTEMPT_WINDOW_MINUTES = 15;
export const LOGIN_ATTEMPT_LIMIT = 8;
export const LOGIN_BLOCK_MINUTES = 10;
export const CLIENT_IP_ATTEMPT_LIMIT = 100;

export function normalizeLoginIdentifier(identifier: string): string {
  return identifier.trim().toLocaleLowerCase("en-US");
}

function keyedDigest(scope: string, identity: string, signingSecret: string): string {
  if (signingSecret.length < 32) {
    throw new Error("Login throttle requires a configured signing secret.");
  }
  return createHmac("sha256", signingSecret)
    .update("pos:auth:" + scope + ":v1:")
    .update(identity)
    .digest("hex");
}

/** Never persist usernames or user UUIDs as plaintext throttle keys. */
export function loginThrottleKey(identity: string, signingSecret: string): string {
  return keyedDigest("login", normalizeLoginIdentifier(identity), signingSecret);
}

/** Keys client IP addresses separately to avoid mixing them with account keys. */
export function clientIpThrottleKey(ip: string, signingSecret: string): string {
  if (isIP(ip) === 0) throw new Error("Invalid client IP for throttling.");
  return keyedDigest("ip", ip.toLowerCase(), signingSecret);
}

/**
 * Trust only Netlify's platform-injected header when in a Netlify runtime.
 * Explicitly ignore caller-provided X-Forwarded-For and arbitrary headers.
 * The presence of the platform header must be verified in a real preview
 * before claiming that per-IP abuse throttling is operational.
 */
export function trustedNetlifyClientIp(
  request: Request,
  isTrustedNetlifyRuntime: boolean,
): string | null {
  if (!isTrustedNetlifyRuntime) return null;
  const value = request.headers.get("x-nf-client-connection-ip")?.trim() ?? "";
  return isIP(value) !== 0 ? value : null;
}
