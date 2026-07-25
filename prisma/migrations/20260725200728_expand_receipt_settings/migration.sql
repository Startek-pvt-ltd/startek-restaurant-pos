-- AlterTable
ALTER TABLE "SystemSetting" ADD COLUMN     "autoOpenReceiptAfterCheckout" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptDeveloperCredit" TEXT NOT NULL DEFAULT 'Design & Deploy by
Startek (PVT) LTD',
ADD COLUMN     "receiptShowCustomerInfo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowServiceCharge" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowTax" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptThankYouMessage" TEXT NOT NULL DEFAULT 'Thank You!
Please Visit Again';
