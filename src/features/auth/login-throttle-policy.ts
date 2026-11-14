import { createHmac } from "node:crypto";

export const LOGIN_ATTEMPT_WINDOW_MINUTES = 15;
export const LOGIN_ATTEMPT_LIMIT = 8;
export const LOGIN_BLOCK_MINUTES = 10;

export function normalizeLoginIdentifier(identifier: string): string {
  return identifier.trim().toLocaleLowerCase("en-US");
}

/** Keyed digest avoids storing usernames, emails, or credentials. */
export function loginThrottleKey(identifier: string, signingSecret: string): string {
  if (signingSecret.length < 32) {
    throw new Error("Login throttle requires a configured signing secret.");
  }
  return createHmac("sha256", signingSecret)
    .update("pos:auth:login:v1:")
    .update(normalizeLoginIdentifier(identifier))
    .digest("hex");
}
