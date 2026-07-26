import { ClipboardList } from "lucide-react";

import type { OrderListRecord } from "@/features/orders/types";
import { formatMoney } from "@/features/pos/lib/format-money";

import { OrderActionControls } from "./OrderActionControls";
import { OrderStatusBadge } from "./OrderStatusBadge";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-LK", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrdersTable({ canCancel, orders }: { canCancel: boolean; orders: OrderListRecord[] }) {
  if (!orders.length) {
    return (
      <section className="rounded-2xl border border-dashed border-input bg-card px-5 py-16 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><ClipboardList aria-hidden="true" className="size-6" /></span>
        <h2 className="mt-4 text-lg font-black text-secondary">No orders found</h2>
        <p className="mt-1 text-sm text-muted-foreground">Try clearing or changing the current search filters.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_32px_rgba(74,35,16,0.07)]" aria-label="Orders">
      <div className="divide-y divide-border md:hidden">
        {orders.map((order) => (
          <article className="space-y-3 p-4" key={order.id}>
            <div className="flex items-start justify-between gap-3"><div><p className="font-black text-secondary">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(order.createdAt)}</p></div><OrderStatusBadge value={order.status} /></div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><dt className="text-xs text-muted-foreground">Order type</dt><dd className="font-bold text-secondary">{order.orderType.replaceAll("_", "-")}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Payment</dt><dd className="font-bold text-secondary">{order.paymentMethod ?? "Not recorded"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Grand total</dt><dd className="font-black text-secondary">{formatMoney(Number(order.grandTotal))}</dd></div>
            </dl>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3"><OrderStatusBadge value={order.paymentStatus ?? "PENDING"} /><OrderActionControls canCancel={canCancel} orderId={order.id} orderNumber={order.orderNumber} status={order.status} /></div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block dashboard-scrollbar">
        <table className="w-full min-w-[1180px] border-collapse text-left">
          <thead className="bg-secondary text-[0.68rem] uppercase tracking-wider text-white/70"><tr>{["Invoice number", "Date and time", "Order type", "Cashier", "Payment", "Payment status", "Order status", "Grand total", "Actions"].map((heading) => <th className="px-4 py-3.5 font-black" key={heading} scope="col">{heading}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr className="transition hover:bg-muted/35" key={order.id}>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-secondary">{order.orderNumber}</td>
                <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-muted-foreground">{formatDate(order.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-xs font-black text-secondary">{order.orderType.replaceAll("_", "-")}</td>
                <td className="px-4 py-4 text-sm font-semibold text-secondary">{order.cashierName}</td>
                <td className="px-4 py-4 text-sm font-bold text-secondary">{order.paymentMethod ?? "—"}</td>
                <td className="px-4 py-4"><OrderStatusBadge value={order.paymentStatus ?? "PENDING"} /></td>
                <td className="px-4 py-4"><OrderStatusBadge value={order.status} /></td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-secondary">{formatMoney(Number(order.grandTotal))}</td>
                <td className="px-4 py-4"><OrderActionControls canCancel={canCancel} orderId={order.id} orderNumber={order.orderNumber} status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
