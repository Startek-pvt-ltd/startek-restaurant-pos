-- Align variant lookup indexes without touching menu, order, expense, or cash-closing data.
DROP INDEX IF EXISTS "MenuItemVariant_menuItemId_active_displayOrder_idx";

CREATE INDEX IF NOT EXISTS "MenuItemVariant_menuItemId_idx"
ON "MenuItemVariant"("menuItemId");

CREATE INDEX IF NOT EXISTS "MenuItemVariant_active_idx"
ON "MenuItemVariant"("active");
