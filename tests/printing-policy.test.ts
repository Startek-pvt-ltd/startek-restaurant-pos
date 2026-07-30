import assert from "node:assert/strict";
import test from "node:test";

import { shouldOpenCashDrawer } from "../src/features/printing/lib/printing-policy";
import { renderReceiptText } from "../src/features/printing/lib/receipt-text";

test("cash-only mode opens the drawer only for cash", () => {
  assert.equal(shouldOpenCashDrawer("CASH", true, "CASH_ONLY"), true);
  assert.equal(shouldOpenCashDrawer("CARD", true, "CASH_ONLY"), false);
  assert.equal(shouldOpenCashDrawer("QR", true, "CASH_ONLY"), false);
  assert.equal(shouldOpenCashDrawer("CASH", false, "CASH_ONLY"), false);
});

test("all-payments mode opens the enabled drawer for non-cash payments", () => {
  assert.equal(shouldOpenCashDrawer("CARD", true, "ALL_PAYMENTS"), true);
  assert.equal(shouldOpenCashDrawer("QR", true, "ALL_PAYMENTS"), true);
});

test("direct receipt omits order type and ends with the Startek credit", () => {
  const order = {
    id: "order", orderNumber: "RKH-1", createdAt: "2026-07-31T09:00:00.000Z", updatedAt: "2026-07-31T09:00:00.000Z",
    orderType: "TAKEAWAY", status: "COMPLETED", notes: null, cancellationReason: null, cancelledAt: null, cancelledBy: null, cashierName: "Cashier",
    items: [{ id: "item", name: "Long Chicken Fried Rice", variantName: "Full", quantity: 2, unitPrice: "700.00", totalPrice: "1400.00", notes: null }],
    subtotal: "1400.00", discount: "0", tax: "0", serviceCharge: "0", grandTotal: "1400.00",
    payment: { paymentMethod: "CASH", paymentStatus: "PAID", amount: "1400.00", receivedAmount: "1500.00", balance: "100.00", reference: null },
    restaurant: { name: "Rice & Kottu Hut", address: "", addressLine1: "Main Street", addressLine2: null, city: "Colombo", phone: "0112345678", phone2: null, email: null, taxNumber: null, logo: null, currency: "Rs.", receiptFooter: null },
  };
  const settings = { headerMessage: "", showCashier: true, thankYouMessage: "Thank You!", visitAgainMessage: "Please Visit Again" };
  const receipt = renderReceiptText(order as never, settings as never);
  assert.equal(receipt.includes("Order Type"), false);
  assert.equal(receipt.includes("TAKEAWAY"), false);
  assert.match(receipt, /Item\s+Qty\s+Price\s+Total/);
  assert.equal(receipt.trimEnd().endsWith("Powered by Startek (PVT) LTD"), true);
});
