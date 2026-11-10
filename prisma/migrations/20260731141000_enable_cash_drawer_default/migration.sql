ALTER TABLE "SystemSetting" ALTER COLUMN "openCashDrawer" SET DEFAULT true;
UPDATE "SystemSetting" SET "openCashDrawer" = true;
