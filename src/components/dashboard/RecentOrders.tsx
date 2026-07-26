import { ArrowUpRight, ClipboardList } from "lucide-react";
import Link from "next/link";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { formatDashboardMoney, formatDashboardTime, readableEnum } from "@/features/dashboard/formatters";
import type { DashboardOrder } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

const statusStyles = {
  PENDING: "bg-primary/15 text-[#8a5e00] dark:text-primary",
  CONFIRMED: "bg-accent/10 text-accent",
  PREPARING: "bg-accent/10 text-accent",
  READY: "bg-success/10 text-success",
  COMPLETED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function RecentOrders({ orders }: { orders: DashboardOrder[] }) {
  return <article className="dashboard-card overflow-hidden rounded-2xl border border-border/80 bg-card"><div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6"><div><h2 className="text-base font-bold text-foreground">Recent Orders</h2><p className="mt-1 text-xs text-muted-foreground">Latest database orders across all sales channels</p></div><Link className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-secondary transition hover:bg-muted hover:text-accent focus-visible:ring-2 focus-visible:ring-primary" href="/orders">View all <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link></div>{!orders.length ? <div className="p-5"><DashboardEmptyState icon={ClipboardList} message="No orders have been recorded yet." /></div> : <div className="overflow-x-auto dashboard-scrollbar"><table className="w-full min-w-[860px] text-left"><thead><tr className="bg-muted/45 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{["Invoice Number", "Order Type", "Cashier", "Payment Method", "Status", "Amount", "Time"].map((heading) => <th className="px-5 py-3 font-bold first:pl-6" key={heading} scope="col">{heading}</th>)}</tr></thead><tbody className="divide-y divide-border/75">{orders.map((order) => <tr className="text-xs transition hover:bg-muted/30" key={order.id}><td className="whitespace-nowrap px-5 py-4 pl-6"><Link className="font-bold text-foreground hover:text-accent focus-visible:ring-2 focus-visible:ring-primary" href={`/orders/${order.id}`}>{order.orderNumber}</Link></td><td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{readableEnum(order.orderType)}</td><td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.cashierName}</td><td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.paymentMethod ? readableEnum(order.paymentMethod) : "Not recorded"}</td><td className="whitespace-nowrap px-5 py-4"><span className={cn("inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold", statusStyles[order.status])}>{readableEnum(order.status)}</span></td><td className="whitespace-nowrap px-5 py-4 font-bold text-foreground">{formatDashboardMoney(order.grandTotal)}</td><td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{formatDashboardTime(order.createdAt)}</td></tr>)}</tbody></table></div>}</article>;
}
