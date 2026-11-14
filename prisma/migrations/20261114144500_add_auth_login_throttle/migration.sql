-- Additive table; requires isolated CI validation before production.
CREATE TABLE "AuthLoginThrottle" (
    "keyHash" VARCHAR(64) NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthLoginThrottle_pkey" PRIMARY KEY ("keyHash")
);
CREATE INDEX "AuthLoginThrottle_updatedAt_idx" ON "AuthLoginThrottle"("updatedAt");
