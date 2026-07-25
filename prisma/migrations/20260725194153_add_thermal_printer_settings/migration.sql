-- AlterTable
ALTER TABLE "SystemSetting" ADD COLUMN     "autoPrintAfterCheckout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openCashDrawer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "printLogo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "printerName" TEXT NOT NULL DEFAULT 'Xprinter XP-80T',
ADD COLUMN     "printerPaperWidth" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "receiptCopies" INTEGER NOT NULL DEFAULT 1;
