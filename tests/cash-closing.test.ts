import assert from "node:assert/strict";
import test from "node:test";
import { calculateCashDifference, calculateExpectedCash } from "../src/features/cash-closing/lib/cash-calculations";
import { closeCashSessionSchema, openCashSessionSchema } from "../src/features/cash-closing/validations/cash-session-schema";

test("expected drawer includes only opening cash, cash sales, and cash expenses", () => {
  assert.equal(calculateExpectedCash(10_000, 48_500, 7_250), 51_250);
});
test("cash difference supports exact, over, and short values", () => {
  assert.equal(calculateCashDifference(1_000, 1_000), 0);
  assert.equal(calculateCashDifference(1_025, 1_000), 25);
  assert.equal(calculateCashDifference(975, 1_000), -25);
});
test("schemas reject negative opening cash and unconfirmed closes", () => {
  assert.equal(openCashSessionSchema.safeParse({ openingCash: "-1", openingNote: "" }).success, false);
  assert.equal(closeCashSessionSchema.safeParse({ sessionId: "bad", actualCash: "10", notes: "", currentPassword: "secret", confirmed: false }).success, false);
});
