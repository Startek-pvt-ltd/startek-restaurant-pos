# Menu Item Variants

Menu prices are stored in `MenuItemVariant` using PostgreSQL `DECIMAL(12,2)` values. Rice & Kottu Hut currently uses `NORMAL` and `FULL` variants. The composite unique constraint on `menuItemId` and `name` prevents duplicate size names for one item.

`OrderItem.menuItemVariantId` links a new order line to the selected variant. `OrderItem.variantName` and the existing `unitPrice` are snapshots, so receipts and reports keep the sold size and price even after menu pricing changes. Both fields are nullable so historical orders created before this migration remain unchanged.

## Compatibility

`MenuItem.price` remains temporarily as the legacy/default price and mirrors the NORMAL price on new menu-management writes and menu imports. Existing single-price items received one NORMAL variant during migration. The column must not be removed until all integrations read variants and a separately reviewed migration confirms no legacy consumer remains.

## Restaurant menu import

After applying migrations, run:

```bash
npm run prisma:seed-menu-sizes
```

The import is idempotent. It matches categories and menu items case-insensitively, creates missing records, and upserts the required NORMAL and FULL prices without deleting menu items or order history.
