import type { OrderDetailRecord } from "@/features/orders/types";
import type { ReceiptPrintSettings } from "@/features/settings/types";

const WIDTH = 48;

function fit(value: string, width: number) { return value.length > width ? `${value.slice(0, Math.max(0, width - 1))}…` : value.padEnd(width); }
function right(value: string, width: number) { return value.length > width ? value.slice(-width) : value.padStart(width); }
function center(value: string) { return value.length >= WIDTH ? value : value.padStart(Math.floor((WIDTH + value.length) / 2)); }
function pair(label: string, value: string) { return `${fit(label, 20)}${right(value, WIDTH - 20)}`; }
function money(value: string | null | undefined, currency: string) { return `${currency} ${Number(value ?? 0).toFixed(2)}`; }
function wrap(value: string, width: number) {
  const words = value.trim().split(/\s+/); const lines: string[] = []; let line = "";
  for (const word of words) {
    if (word.length > width) {
      if (line) { lines.push(line); line = ""; }
      let remaining = word;
      while (remaining.length > width) { lines.push(remaining.slice(0, width)); remaining = remaining.slice(width); }
      line = remaining;
      continue;
    }
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= width) line = candidate;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line); return lines.length ? lines : [""];
}

export function renderReceiptText(order: OrderDetailRecord, settings: ReceiptPrintSettings) {
  const lines: string[] = [];
  const address = [order.restaurant.addressLine1, order.restaurant.addressLine2, order.restaurant.city].filter(Boolean).join(", ");
  lines.push(center(order.restaurant.name), center(address), center([order.restaurant.phone, order.restaurant.phone2].filter(Boolean).join(" / ")));
  if (settings.headerMessage) lines.push(center(settings.headerMessage));
  lines.push("-".repeat(WIDTH), pair("Invoice", order.orderNumber));
  const created = new Date(order.createdAt);
  lines.push(pair("Date", created.toLocaleDateString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "medium" })));
  lines.push(pair("Time", created.toLocaleTimeString("en-LK", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" })));
  if (settings.showCashier) lines.push(pair("Cashier", order.cashierName));
  lines.push("-".repeat(WIDTH), `${fit("Item", 18)}${right("Qty", 3)}${right("Price", 13)}${right("Total", 14)}`, "-".repeat(WIDTH));
  for (const item of order.items) {
    const name = `${item.name}${item.variantName ? ` - ${item.variantName}` : ""}`;
    const names = wrap(name, 18);
    lines.push(`${fit(names[0] ?? "", 18)}${right(String(item.quantity), 3)}${right(money(item.unitPrice, order.restaurant.currency), 13)}${right(money(item.totalPrice, order.restaurant.currency), 14)}`);
    for (const continuation of names.slice(1)) lines.push(fit(continuation, 18));
  }
  lines.push("-".repeat(WIDTH), pair("Subtotal", money(order.subtotal, order.restaurant.currency)));
  if (Number(order.discount) > 0) lines.push(pair("Discount", `-${money(order.discount, order.restaurant.currency)}`));
  if (Number(order.tax) > 0) lines.push(pair("Tax", money(order.tax, order.restaurant.currency)));
  if (Number(order.serviceCharge) > 0) lines.push(pair("Service Charge", money(order.serviceCharge, order.restaurant.currency)));
  lines.push("=".repeat(WIDTH), pair("GRAND TOTAL", money(order.grandTotal, order.restaurant.currency)), "=".repeat(WIDTH));
  if (order.payment) lines.push(pair("Payment", order.payment.paymentMethod));
  lines.push("-".repeat(WIDTH), center(settings.thankYouMessage), center(settings.visitAgainMessage), "", center("Powered by Startek (PVT) LTD"));
  return `${lines.join("\n")}\n`;
}
