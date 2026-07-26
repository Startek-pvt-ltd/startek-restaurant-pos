-- Add menu item variants without removing or rewriting existing menu or order data.
CREATE TABLE "MenuItemVariant" (
    "id" UUID NOT NULL,
    "menuItemId" UUID NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItemVariant_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OrderItem"
ADD COLUMN "menuItemVariantId" UUID,
ADD COLUMN "variantName" VARCHAR(32);

-- Give every existing menu item a sellable NORMAL variant at its current price.
-- Historical OrderItem rows deliberately retain NULL variant fields.
INSERT INTO "MenuItemVariant" (
    "id",
    "menuItemId",
    "name",
    "price",
    "displayOrder",
    "active",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid(),
    item."id",
    'NORMAL',
    item."price",
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "MenuItem" AS item;

CREATE UNIQUE INDEX "MenuItemVariant_menuItemId_name_key"
ON "MenuItemVariant"("menuItemId", "name");

CREATE INDEX "MenuItemVariant_menuItemId_active_displayOrder_idx"
ON "MenuItemVariant"("menuItemId", "active", "displayOrder");

CREATE INDEX "OrderItem_menuItemVariantId_idx"
ON "OrderItem"("menuItemVariantId");

ALTER TABLE "MenuItemVariant"
ADD CONSTRAINT "MenuItemVariant_menuItemId_fkey"
FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_menuItemVariantId_fkey"
FOREIGN KEY ("menuItemVariantId") REFERENCES "MenuItemVariant"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
