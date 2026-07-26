-- A client-generated token makes a repeated checkout request return the
-- original order instead of charging and recording the order twice.
ALTER TABLE "Order" ADD COLUMN "checkoutToken" UUID;
CREATE UNIQUE INDEX "Order_checkoutToken_key" ON "Order"("checkoutToken");
