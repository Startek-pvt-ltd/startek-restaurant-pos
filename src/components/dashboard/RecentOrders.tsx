import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const statusStyles = {
  Pending: "bg-primary/15 text-[#8a5e00]",
  Confirmed: "bg-primary/15 text-[#8a5e00]",
  Preparing: "bg-primary/15 text-[#8a5e00]",
  Ready: "bg-primary/15 text-[#8a5e00]",
  Completed: "bg-success/10 text-[#147338]",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function RecentOrders({ orders }: { orders: Array<{ id: string; invoice: string; orderType: string; cashier: string; payment: string; status: keyof typeof statusStyles; amount: string; time: string }> }) {
  return (
    <article className="dashboard-card dashboard-fade-in overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent Orders</h2>
          <p className="mt-1 text-xs text-muted-foreground">Latest orders across all sales channels</p>
        </div>
        <Link
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-secondary transition hover:bg-muted hover:text-accent focus-visible:ring-2 focus-visible:ring-primary"
          href="/orders"
        >
          View all <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto dashboard-scrollbar">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="bg-muted/45 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              {["Invoice Number", "Order Type", "Cashier", "Payment Method", "Status", "Amount", "Time"].map(
                (heading) => (
                  <th className="px-5 py-3 font-bold first:pl-6" key={heading} scope="col">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/75">
            {orders.length === 0 && <tr><td className="px-6 py-5 text-sm text-muted-foreground" colSpan={7}>No orders recorded.</td></tr>}
            {orders.map((order) => (
              <tr className="text-xs transition hover:bg-muted/30" key={order.id}>
                <td className="whitespace-nowrap px-5 py-4 pl-6 font-bold text-foreground"><Link className="hover:underline focus-visible:underline" href={`/orders/${order.id}`}>{order.invoice}</Link></td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.orderType}</td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.cashier}</td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.payment}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold",
                      statusStyles[order.status],
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-bold text-foreground">{order.amount}</td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
