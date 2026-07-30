export function shouldOpenCashDrawer(paymentMethod: string, enabled: boolean, mode: "CASH_ONLY" | "ALL_PAYMENTS") {
  return enabled && (mode === "ALL_PAYMENTS" || paymentMethod === "CASH");
}
