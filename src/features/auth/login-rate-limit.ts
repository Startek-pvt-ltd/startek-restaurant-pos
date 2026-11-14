import "server-only";

import { prisma } from "@/lib/prisma";
import {
  CLIENT_IP_ATTEMPT_LIMIT,
  LOGIN_ATTEMPT_LIMIT,
  clientIpThrottleKey,
  loginThrottleKey,
} from "./login-throttle-policy";

type ThrottleState = { blockedUntil: Date | null };

/**
 * Atomic PostgreSQL upsert serializes attempts across serverless instances.
 * A blocked account gets a fresh window after its lock expires, rather than
 * being re-blocked immediately while the original 15-minute window remains.
 */
async function consumeThrottleKey(keyHash: string, maxAttempts: number): Promise<boolean> {
  const threshold = maxAttempts - 1;
  const rows = await prisma.$queryRaw<ThrottleState[]>`
    INSERT INTO "AuthLoginThrottle" AS previous
      ("keyHash", "windowStartedAt", "attemptCount", "blockedUntil", "updatedAt")
    VALUES (${keyHash}, CURRENT_TIMESTAMP, 1, NULL, CURRENT_TIMESTAMP)
    ON CONFLICT ("keyHash") DO UPDATE SET
      "attemptCount" = CASE
        WHEN previous."blockedUntil" > CURRENT_TIMESTAMP THEN previous."attemptCount"
        WHEN previous."blockedUntil" IS NOT NULL
          OR previous."windowStartedAt" < CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN 1
        ELSE LEAST(previous."attemptCount" + 1, 1000000)
      END,
      "windowStartedAt" = CASE
        WHEN previous."blockedUntil" IS NOT NULL
          AND previous."blockedUntil" <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP
        WHEN previous."windowStartedAt" < CURRENT_TIMESTAMP - INTERVAL '15 minutes'
          THEN CURRENT_TIMESTAMP
        ELSE previous."windowStartedAt"
      END,
      "blockedUntil" = CASE
        WHEN previous."blockedUntil" > CURRENT_TIMESTAMP THEN previous."blockedUntil"
        WHEN previous."blockedUntil" IS NOT NULL
          OR previous."windowStartedAt" < CURRENT_TIMESTAMP - INTERVAL '15 minutes'
          THEN NULL
        WHEN previous."attemptCount" >= ${threshold}
          THEN CURRENT_TIMESTAMP + INTERVAL '10 minutes'
        ELSE NULL
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "blockedUntil"
  `;
  const current = rows[0];
  if (!current) return false;
  return !(current.blockedUntil && current.blockedUntil.getTime() > Date.now());
}

/**
 * The lookup must have resolved aliases first: use "user:<UUID>" for a
 * known account, or "unknown:<normalized input>" for unknown identifiers.
 * That prevents switching between email and username to reset the counter.
 */
export async function consumeAccountLoginAttempt(identity: string): Promise<boolean> {
  return consumeThrottleKey(
    loginThrottleKey(identity, process.env.AUTH_SECRET ?? ""),
    LOGIN_ATTEMPT_LIMIT,
  );
}

/**
 * Secondary per-IP limit runs only if the Netlify client-IP header was
 * validated by trustedNetlifyClientIp. Missing header is not an IP identity.
 */
export async function consumeClientLoginAttempt(ip: string | null): Promise<boolean> {
  if (!ip) return true;
  return consumeThrottleKey(
    clientIpThrottleKey(ip, process.env.AUTH_SECRET ?? ""),
    CLIENT_IP_ATTEMPT_LIMIT,
  );
}

export async function clearAccountLoginAttempt(identity: string): Promise<void> {
  const keyHash = loginThrottleKey(identity, process.env.AUTH_SECRET ?? "");
  await prisma.authLoginThrottle.deleteMany({ where: { keyHash } });
}
