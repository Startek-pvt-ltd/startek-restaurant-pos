import "server-only";

import { prisma } from "@/lib/prisma";
import { loginThrottleKey } from "./login-throttle-policy";

type ThrottleState = { blockedUntil: Date | null };

/**
 * Atomic PostgreSQL upsert serializes account attempts across serverless instances.
 * This is an identifier-only control; provider-level IP throttling is still needed
 * against large-scale identifier spraying or deliberate account lockout.
 */
export async function consumeLoginAttempt(identifier: string): Promise<boolean> {
  const keyHash = loginThrottleKey(identifier, process.env.AUTH_SECRET ?? "");
  const rows = await prisma.$queryRaw<ThrottleState[]>`
    INSERT INTO "AuthLoginThrottle" AS previous
      ("keyHash", "windowStartedAt", "attemptCount", "blockedUntil", "updatedAt")
    VALUES (${keyHash}, CURRENT_TIMESTAMP, 1, NULL, CURRENT_TIMESTAMP)
    ON CONFLICT ("keyHash") DO UPDATE SET
      "attemptCount" = CASE
        WHEN previous."windowStartedAt" < CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN 1
        ELSE LEAST(previous."attemptCount" + 1, 1000000)
      END,
      "windowStartedAt" = CASE
        WHEN previous."windowStartedAt" < CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN CURRENT_TIMESTAMP
        ELSE previous."windowStartedAt"
      END,
      "blockedUntil" = CASE
        WHEN previous."blockedUntil" > CURRENT_TIMESTAMP THEN previous."blockedUntil"
        WHEN previous."windowStartedAt" < CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN NULL
        WHEN previous."attemptCount" >= 7 THEN CURRENT_TIMESTAMP + INTERVAL '10 minutes'
        ELSE NULL
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "blockedUntil"
  `;
  const current = rows[0];
  if (!current) return false;
  return !(current.blockedUntil && current.blockedUntil.getTime() > Date.now());
}

export async function clearLoginAttempt(identifier: string): Promise<void> {
  const keyHash = loginThrottleKey(identifier, process.env.AUTH_SECRET ?? "");
  await prisma.authLoginThrottle.deleteMany({ where: { keyHash } });
}
