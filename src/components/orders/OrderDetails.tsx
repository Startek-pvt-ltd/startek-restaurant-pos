import { ArrowLeft, CalendarClock, CreditCard, MapPin, Phone, ReceiptText, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/features/pos/lib/format-money";
import type { OrderDetailRecord } from "@/features/orders/types";

import { OrderActionControls } from "./OrderActionControls";
import { OrderStatusBadge } from "./OrderStatusBadge";

function DetailRow({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return <div className="flex items-start justify-between gap-5 py-2.5 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className={strong ? "text-right font-black text-secondary" : "text-right font-bold text-secondary"}>{value}</dd></div>;
}

export function OrderDetails({ canCancel, order }: { canCancel: boolean; order: OrderDetailRecord }) {
  const currency = order.restaurant.currency;
  const money = (value: string | null) => formatMoney(Number(value ?? 0), currency);
  const formattedDate = new Date(order.createdAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "long", timeStyle: "short" });
  const logo = order.restaurant.logo?.startsWith("/") ? order.restaurant.logo : "/logos/rice-kottu-hut-logo.png";

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link className="inline-flex items-center gap-1.5 text-sm font-black text-muted-foreground transition hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary" href="/orders"><ArrowLeft aria-hidden="true" className="size-4" />Return to orders</Link>
          <div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="text-2xl font-black tracking-tight text-secondary sm:text-3xl">{order.orderNumber}</h1><OrderStatusBadge value={order.status} /></div>
          <p className="mt-1 text-sm text-muted-foreground">Created {formattedDate}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Link className="flex h-10 items-center gap-2 rounded-xl bg-secondary px-4 text-xs font-black text-white transition hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary" href={`/orders/${order.id}/receipt`}><ReceiptText aria-hidden="true" className="size-4" />View Receipt</Link><OrderActionControls canCancel={canCancel} orderId={order.id} orderNumber={order.orderNumber} showView={false} status={order.status} /></div>
      </header>

      {order.status === "CANCELLED" && (
        <section className="rounded-2xl border border-destructive/25 bg-destructive/7 p-4" role="status">
          <h2 className="font-black text-destructive">Order cancelled</h2>
          <p className="mt-1 text-sm text-red-800">{order.cancellationReason}</p>
          <p className="mt-2 text-xs font-semibold text-red-700">By {order.cancelledBy ?? "Unknown user"}{order.cancelledAt ? ` · ${new Date(order.cancelledAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}` : ""}</p>
        </section>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="dashboard-card rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4"><span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-white p-1.5"><Image alt={`${order.restaurant.name} logo`} className="h-full w-full object-contain" height={100} src={logo} width={100} /></span><div><h2 className="text-xl font-black text-secondary">{order.restaurant.name}</h2><p className="text-xs font-bold uppercase tracking-wider text-primary">Restaurant invoice</p></div></div>
              <div className="space-y-1 text-sm text-muted-foreground sm:text-right"><p className="flex items-center gap-2 sm:justify-end"><MapPin aria-hidden="true" className="size-4" />{order.restaurant.address}</p><p className="flex items-center gap-2 sm:justify-end"><Phone aria-hidden="true" className="size-4" />{order.restaurant.phone}</p>{order.restaurant.taxNumber && <p>Tax No: {order.restaurant.taxNumber}</p>}</div>
            </div>

            <div className="grid gap-4 py-5 sm:grid-cols-3">
              <div className="rounded-xl bg-background/60 p-3"><CalendarClock aria-hidden="true" className="size-4 text-primary" /><p className="mt-2 text-xs text-muted-foreground">Date and time</p><p className="mt-0.5 text-sm font-black text-secondary">{formattedDate}</p></div>
              <div className="rounded-xl bg-background/60 p-3"><UserRound aria-hidden="true" className="size-4 text-primary" /><p className="mt-2 text-xs text-muted-foreground">Cashier</p><p className="mt-0.5 text-sm font-black text-secondary">{order.cashierName}</p></div>
              <div className="rounded-xl bg-background/60 p-3"><ReceiptText aria-hidden="true" className="size-4 text-primary" /><p className="mt-2 text-xs text-muted-foreground">Order type</p><p className="mt-0.5 text-sm font-black text-secondary">{order.orderType.replaceAll("_", "-")}</p></div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border dashboard-scrollbar">
              <table className="w-full min-w-[600px] text-left"><thead className="bg-secondary text-xs uppercase tracking-wide text-white/70"><tr><th className="px-4 py-3">Item</th><th className="px-4 py-3 text-center">Quantity</th><th className="px-4 py-3 text-right">Unit price</th><th className="px-4 py-3 text-right">Line total</th></tr></thead><tbody className="divide-y divide-border">{order.items.map((item) => <tr key={item.id}><td className="px-4 py-3"><p className="text-sm font-black text-secondary">{item.name}</p>{item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}</td><td className="px-4 py-3 text-center text-sm font-bold">{item.quantity}</td><td className="px-4 py-3 text-right text-sm font-semibold">{money(item.unitPrice)}</td><td className="px-4 py-3 text-right text-sm font-black text-secondary">{money(item.totalPrice)}</td></tr>)}</tbody></table>
            </div>

            {order.notes && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-amber-800">Order notes</p><p className="mt-1 text-sm text-amber-900">{order.notes}</p></div>}
          </section>

          <section className="dashboard-card rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2"><CreditCard aria-hidden="true" className="size-5 text-primary" /><h2 className="text-lg font-black text-secondary">Payment information</h2></div>
            {order.payment ? <dl className="grid gap-x-8 sm:grid-cols-2"><DetailRow label="Payment method" value={order.payment.paymentMethod} /><DetailRow label="Payment status" value={<OrderStatusBadge value={order.payment.paymentStatus} />} /><DetailRow label="Payment amount" value={money(order.payment.amount)} /><DetailRow label="Amount received" value={order.payment.receivedAmount ? money(order.payment.receivedAmount) : "—"} /><DetailRow label="Balance" value={order.payment.balance ? money(order.payment.balance) : "—"} /><DetailRow label="Reference" value={order.payment.reference ?? "—"} /></dl> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No payment has been recorded for this order.</p>}
          </section>
        </div>

        <aside className="dashboard-card rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-black text-secondary">Order summary</h2>
          <dl className="mt-3 divide-y divide-border"><DetailRow label="Subtotal" value={money(order.subtotal)} /><DetailRow label="Discount" value={`− ${money(order.discount)}`} /><DetailRow label="Tax" value={money(order.tax)} /><DetailRow label="Service charge" value={money(order.serviceCharge)} /><div className="flex items-center justify-between gap-5 pt-4"><dt className="font-black text-secondary">Grand total</dt><dd className="text-xl font-black text-secondary">{money(order.grandTotal)}</dd></div></dl>
          <div className="mt-5 border-t border-border pt-5"><h3 className="text-sm font-black text-secondary">Customer</h3>{order.customer ? <div className="mt-2 text-sm"><p className="font-bold text-secondary">{order.customer.fullName}</p><p className="text-muted-foreground">{order.customer.phone}</p>{order.customer.email && <p className="break-all text-muted-foreground">{order.customer.email}</p>}{order.customer.address && <p className="mt-1 text-muted-foreground">{order.customer.address}</p>}</div> : <p className="mt-2 text-sm text-muted-foreground">Walk-in Customer</p>}</div>
          {order.restaurant.receiptFooter && <p className="mt-6 whitespace-pre-line border-t border-dashed border-border pt-5 text-center text-xs leading-5 text-muted-foreground">{order.restaurant.receiptFooter}</p>}
        </aside>
      </div>
    </div>
  );
}
