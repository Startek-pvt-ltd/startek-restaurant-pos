-- Add staff audit and revocable-session fields without changing existing users.
ALTER TABLE "User"
ADD COLUMN "lastLogin" TIMESTAMP(3),
ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_lastLogin_idx" ON "User"("lastLogin");
