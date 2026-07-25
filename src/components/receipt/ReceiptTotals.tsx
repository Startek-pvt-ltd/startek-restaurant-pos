import type { OrderDetailRecord } from "@/features/orders/types";
import type { PrinterSettings } from "@/features/settings/types";

import { ReceiptRow } from "./ReceiptRow";

export function ReceiptTotals({ money, order, settings }: { money: (value: string | null | undefined) => string; order: OrderDetailRecord; settings: PrinterSettings }) {
  return <section className="receipt-section receipt-summary"><ReceiptRow label="Subtotal" value={money(order.subtotal)} /><ReceiptRow label="Discount" value={`-${money(order.discount)}`} />{settings.showTaxLine && <ReceiptRow label="Tax" value={money(order.tax)} />}{settings.showServiceChargeLine && <ReceiptRow label="Service Charge" value={money(order.serviceCharge)} />}<ReceiptRow label="GRAND TOTAL" strong value={money(order.grandTotal)} /></section>;
}
