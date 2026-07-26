-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('FULL_DATABASE', 'BUSINESS_DATA', 'CONFIGURATION');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'DELETED', 'RESTORED');

-- CreateTable
CREATE TABLE "BackupRecord" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "backupType" "BackupType" NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'PENDING',
    "fileSize" BIGINT,
    "checksum" VARCHAR(64),
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "databaseVersion" TEXT,
    "applicationVersion" TEXT NOT NULL,

    CONSTRAINT "BackupRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackupRecord_status_createdAt_idx" ON "BackupRecord"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BackupRecord_backupType_createdAt_idx" ON "BackupRecord"("backupType", "createdAt");

-- CreateIndex
CREATE INDEX "BackupRecord_createdById_idx" ON "BackupRecord"("createdById");

-- AddForeignKey
ALTER TABLE "BackupRecord" ADD CONSTRAINT "BackupRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
