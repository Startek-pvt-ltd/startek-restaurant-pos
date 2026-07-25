-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'TAKEAWAY';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "changeAmount" DECIMAL(12,2),
ADD COLUMN     "receivedAmount" DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "Order_orderType_idx" ON "Order"("orderType");
