import assert from "node:assert/strict";
import test from "node:test";

import { EXPENSE_ACCESS_ROLES, EXPENSE_DELETE_ROLES } from "../src/features/expenses/types";
import { calculateTotals } from "../src/features/pos/lib/calculate-totals";
import { checkoutSchema } from "../src/features/pos/validations/checkout";
import { menuItemSchema } from "../src/features/menu/validations/menu-item";

const checkout = {
  checkoutToken: "550e8400-e29b-41d4-a716-446655440099",
  items: [{ menuItemId: "550e8400-e29b-41d4-a716-446655440000", menuItemVariantId: "550e8400-e29b-41d4-a716-446655440001", quantity: 2 }],
  orderType: "TAKEAWAY" as const,
  notes: "",
  paymentMethod: "CASH" as const,
  amountReceived: 2_000,
};
const menuItemId = "550e8400-e29b-41d4-a716-446655440000";
const menuItemVariantId = "550e8400-e29b-41d4-a716-446655440001";

test("cashiers can access expenses but cannot delete them", () => {
  assert.equal(EXPENSE_ACCESS_ROLES.includes("CASHIER"), true);
  assert.equal((EXPENSE_DELETE_ROLES as readonly string[]).includes("CASHIER"), false);
});

test("checkout accepts the subtotal-only payload", () => {
  assert.equal(checkoutSchema.safeParse(checkout).success, true);
});

test("checkout rejects crafted discount, tax, and service charge fields", () => {
  for (const field of ["discountValue", "discountType", "tax", "serviceCharge"] as const) {
    assert.equal(checkoutSchema.safeParse({ ...checkout, [field]: field === "discountType" ? "FIXED" : 10 }).success, false);
  }
});

test("checkout accepts a single-price item without a selected variant", () => {
  const withoutVariant = { ...checkout, items: [{ menuItemId, menuItemVariantId: null, quantity: 1 }] };
  assert.equal(checkoutSchema.safeParse(withoutVariant).success, true);
});

test("checkout discards a manipulated client price", () => {
  const parsed = checkoutSchema.parse({
    ...checkout,
    items: [{ menuItemId, menuItemVariantId, quantity: 2, price: 0.01 }],
  });
  assert.equal("price" in (parsed.items[0] ?? {}), false);
});

test("menu items support single-price and optional variants", () => {
  const menuItem = {
    name: "Chicken Fried Rice",
    description: "",
    categoryId: "550e8400-e29b-41d4-a716-446655440000",
    price: 700,
    hasVariants: true,
    variants: [
      { name: "Normal", price: 700, active: true },
      { name: "Full", price: 1000, active: true },
    ],
    preparationTime: 10,
    image: "",
    available: true,
  };
  assert.equal(menuItemSchema.safeParse(menuItem).success, true);
  assert.equal(menuItemSchema.safeParse({ ...menuItem, hasVariants: false, variants: [] }).success, true);
  assert.equal(menuItemSchema.safeParse({ ...menuItem, variants: [{ name: "Full", price: 1000, active: false }] }).success, false);
  assert.equal(menuItemSchema.safeParse({ ...menuItem, variants: [{ name: "Full", price: 1000, active: true }, { name: "full", price: 1200, active: true }] }).success, false);
  assert.equal(menuItemSchema.safeParse({ ...menuItem, price: 0 }).success, false);
});

test("new-order totals equal the item subtotal when adjustments are zero", () => {
  const totals = calculateTotals({
    items: [{ price: 625, quantity: 2 }, { price: 250, quantity: 1 }],
    discountType: "FIXED",
    discountValue: 0,
    taxPercentage: 0,
    serviceChargePercentage: 0,
  });
  assert.equal(totals.subtotal, 1_500);
  assert.equal(totals.discount, 0);
  assert.equal(totals.tax, 0);
  assert.equal(totals.serviceCharge, 0);
  assert.equal(totals.grandTotal, totals.subtotal);
});
