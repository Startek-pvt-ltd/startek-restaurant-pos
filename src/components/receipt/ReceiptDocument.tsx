import { formatMoney } from "@/features/pos/lib/format-money";
import type { OrderDetailRecord } from "@/features/orders/types";
import type { PrinterSettings } from "@/features/settings/types";

import { ReceiptFooter } from "./ReceiptFooter";
import { ReceiptHeader } from "./ReceiptHeader";
import { ReceiptItems } from "./ReceiptItems";
import { ReceiptPayment } from "./ReceiptPayment";
import { ReceiptRow } from "./ReceiptRow";
import { ReceiptTotals } from "./ReceiptTotals";

export function ReceiptDocument({ copy, order, settings }: { copy: number; order: OrderDetailRecord; settings: PrinterSettings }) {
  const money = (value: string | null | undefined) => formatMoney(Number(value ?? 0), order.restaurant.currency);
  const createdAt = new Date(order.createdAt);
  const date = createdAt.toLocaleDateString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "medium" });
  const time = createdAt.toLocaleTimeString("en-LK", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" });
  return <article aria-label={`Receipt copy ${copy}`} className="receipt"><ReceiptHeader printLogo={settings.printLogo} priority={copy === 1} /><section className="receipt-section receipt-meta"><ReceiptRow label="Invoice" value={order.orderNumber} /><ReceiptRow label="Date" value={date} /><ReceiptRow label="Time" value={time} /><ReceiptRow label="Cashier" value={order.cashierName} /><ReceiptRow label="Order Type" value={order.orderType.replaceAll("_", "-")} /></section><ReceiptItems items={order.items} money={money} />{order.notes && <section className="receipt-section receipt-notes"><strong>Order Notes</strong><p>{order.notes}</p></section>}<ReceiptTotals money={money} order={order} settings={settings} /><ReceiptPayment money={money} payment={order.payment} /><ReceiptFooter copy={copy} /></article>;
}
