ALTER TABLE "SystemSetting"
ALTER COLUMN "receiptDeveloperCredit" SET DEFAULT 'Powered by Startek (PVT) LTD',
ALTER COLUMN "receiptShowOrderType" SET DEFAULT false,
ALTER COLUMN "receiptCopies" SET DEFAULT 1;

UPDATE "SystemSetting"
SET "receiptDeveloperCredit" = 'Powered by Startek (PVT) LTD',
    "receiptShowOrderType" = false,
    "receiptCopies" = 1;
