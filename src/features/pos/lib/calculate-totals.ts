import type { DiscountType } from "../types";

type PricingLine = { price: number; quantity: number };

interface CalculateTotalsInput {
  items: PricingLine[];
  discountType: DiscountType;
  discountValue: number;
  taxPercentage: number;
  serviceChargePercentage: number;
}

function centsToAmount(cents: number) {
  return Math.round(cents) / 100;
}

export function toCents(amount: number) {
  return Math.round((Number.isFinite(amount) ? amount : 0) * 100);
}

export function calculateTotals({
  items,
  discountType,
  discountValue,
  taxPercentage,
  serviceChargePercentage,
}: CalculateTotalsInput) {
  const subtotalCents = items.reduce(
    (total, item) => total + toCents(item.price) * Math.max(0, Math.trunc(item.quantity)),
    0,
  );
  const normalizedDiscount = Number.isFinite(discountValue) ? discountValue : 0;
  const discountCents =
    discountType === "PERCENTAGE"
      ? Math.round(subtotalCents * (normalizedDiscount / 100))
      : toCents(normalizedDiscount);
  const discountValid =
    normalizedDiscount >= 0 &&
    (discountType !== "PERCENTAGE" || normalizedDiscount <= 100) &&
    discountCents <= subtotalCents;
  const discountedSubtotalCents = Math.max(0, subtotalCents - Math.max(0, discountCents));
  const taxCents = Math.round(
    discountedSubtotalCents * (Math.max(0, taxPercentage) / 100),
  );
  const serviceChargeCents = Math.round(
    discountedSubtotalCents * (Math.max(0, serviceChargePercentage) / 100),
  );
  const grandTotalCents = discountedSubtotalCents + taxCents + serviceChargeCents;

  return {
    subtotal: centsToAmount(subtotalCents),
    discount: centsToAmount(Math.max(0, discountCents)),
    discountedSubtotal: centsToAmount(discountedSubtotalCents),
    tax: centsToAmount(taxCents),
    serviceCharge: centsToAmount(serviceChargeCents),
    grandTotal: centsToAmount(grandTotalCents),
    discountValid,
    totalsValid: grandTotalCents >= 0,
  };
}

export function calculateBalance(amountReceived: number, grandTotal: number) {
  return centsToAmount(toCents(amountReceived) - toCents(grandTotal));
}

