-- Preserve menu and category records referenced by historical orders while
-- allowing them to disappear from active operational screens.
ALTER TABLE "Category" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "MenuItem" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Category_deletedAt_active_displayOrder_idx"
ON "Category"("deletedAt", "active", "displayOrder");

CREATE INDEX "MenuItem_deletedAt_categoryId_idx"
ON "MenuItem"("deletedAt", "categoryId");

CREATE INDEX "MenuItem_deletedAt_available_idx"
ON "MenuItem"("deletedAt", "available");
