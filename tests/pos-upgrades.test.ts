import assert from "node:assert/strict";
import test from "node:test";

import { EXPENSE_ACCESS_ROLES, EXPENSE_DELETE_ROLES } from "../src/features/expenses/types";
import { calculateTotals } from "../src/features/pos/lib/calculate-totals";
import { checkoutSchema } from "../src/features/pos/validations/checkout";

const checkout = {
  items: [{ menuItemId: "550e8400-e29b-41d4-a716-446655440000", quantity: 2 }],
  orderType: "TAKEAWAY" as const,
  notes: "",
  paymentMethod: "CASH" as const,
  amountReceived: 2_000,
};

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
