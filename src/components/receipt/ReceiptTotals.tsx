import type { OrderDetailRecord } from "@/features/orders/types";
import type { PrinterSettings } from "@/features/settings/types";

import { ReceiptRow } from "./ReceiptRow";

export function ReceiptTotals({ money, order, settings }: { money: (value: string | null | undefined) => string; order: OrderDetailRecord; settings: PrinterSettings }) {
  const hasDiscount = Number(order.discount) > 0;
  const hasTax = Number(order.tax) > 0;
  const hasServiceCharge = Number(order.serviceCharge) > 0;
  return <section className="receipt-section receipt-summary"><ReceiptRow label="Subtotal" value={money(order.subtotal)} />{hasDiscount && <ReceiptRow label="Discount" value={`-${money(order.discount)}`} />}{settings.showTaxLine && hasTax && <ReceiptRow label="Tax" value={money(order.tax)} />}{settings.showServiceChargeLine && hasServiceCharge && <ReceiptRow label="Service Charge" value={money(order.serviceCharge)} />}<ReceiptRow label="GRAND TOTAL" strong value={money(order.grandTotal)} /></section>;
}
