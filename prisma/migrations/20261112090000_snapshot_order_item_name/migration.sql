-- Preserve the checkout-time name for new order lines. Legacy lines retain their existing lookup.
ALTER TABLE "OrderItem" ADD COLUMN "itemName" TEXT;
