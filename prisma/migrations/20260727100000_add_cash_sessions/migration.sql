CREATE TYPE "CashSessionStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "ExpensePaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK', 'OTHER');

ALTER TABLE "Expense"
ADD COLUMN "paymentMethod" "ExpensePaymentMethod" NOT NULL DEFAULT 'OTHER';

CREATE TABLE "CashSession" (
    "id" UUID NOT NULL,
    "openedById" UUID NOT NULL,
    "closedById" UUID,
    "openingCash" DECIMAL(12,2) NOT NULL,
    "openingNote" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "status" "CashSessionStatus" NOT NULL DEFAULT 'OPEN',
    "expectedCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actualCash" DECIMAL(12,2),
    "cashDifference" DECIMAL(12,2),
    "cashSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cardSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "qrSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cashExpenses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalExpenses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CashSession_single_open_idx" ON "CashSession" ((status)) WHERE status = 'OPEN';
CREATE INDEX "CashSession_status_idx" ON "CashSession"("status");
CREATE INDEX "CashSession_openedAt_idx" ON "CashSession"("openedAt");
CREATE INDEX "CashSession_closedAt_idx" ON "CashSession"("closedAt");
CREATE INDEX "CashSession_openedById_idx" ON "CashSession"("openedById");
CREATE INDEX "CashSession_closedById_idx" ON "CashSession"("closedById");
CREATE INDEX "Expense_paymentMethod_idx" ON "Expense"("paymentMethod");

ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
