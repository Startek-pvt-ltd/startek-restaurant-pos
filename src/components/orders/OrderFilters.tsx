import { Filter, Search, X } from "lucide-react";
import Link from "next/link";

import type { OrderListFilters } from "@/features/orders/types";

const inputClass = "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm font-semibold text-secondary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

export function OrderFilters({ filters }: { filters: OrderListFilters }) {
  return (
    <form className="dashboard-card rounded-2xl border border-border bg-card p-4" method="get">
      <div className="mb-4 flex items-center gap-2">
        <Filter aria-hidden="true" className="size-4.5 text-primary" />
        <h2 className="font-black text-secondary">Find and filter orders</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <label className="relative sm:col-span-2 2xl:col-span-2">
          <span className="sr-only">Search invoice, customer name, or phone</span>
          <Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input className={`${inputClass} pl-10`} defaultValue={filters.query} name="query" placeholder="Invoice, customer, phone…" type="search" />
        </label>
        <label><span className="mb-1 block text-[0.68rem] font-black uppercase tracking-wide text-muted-foreground">From</span><input className={inputClass} defaultValue={filters.dateFrom} name="dateFrom" type="date" /></label>
        <label><span className="mb-1 block text-[0.68rem] font-black uppercase tracking-wide text-muted-foreground">To</span><input className={inputClass} defaultValue={filters.dateTo} name="dateTo" type="date" /></label>
        <label><span className="sr-only">Order type</span><select className={inputClass} defaultValue={filters.orderType ?? ""} name="orderType"><option value="">All order types</option><option value="DINE_IN">Dine-In</option><option value="TAKEAWAY">Takeaway</option><option value="DELIVERY">Delivery</option></select></label>
        <label><span className="sr-only">Payment method</span><select className={inputClass} defaultValue={filters.paymentMethod ?? ""} name="paymentMethod"><option value="">All payment methods</option><option value="CASH">Cash</option><option value="CARD">Card</option><option value="QR">QR</option></select></label>
        <label><span className="sr-only">Payment status</span><select className={inputClass} defaultValue={filters.paymentStatus ?? ""} name="paymentStatus"><option value="">All payment statuses</option><option value="PENDING">Pending payment</option><option value="PAID">Paid</option><option value="REFUNDED">Refunded</option></select></label>
        <label><span className="sr-only">Order status</span><select className={inputClass} defaultValue={filters.status ?? ""} name="status"><option value="">All order statuses</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></label>
        <label><span className="sr-only">Sort order</span><select className={inputClass} defaultValue={filters.sort} name="sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
        <label><span className="sr-only">Rows per page</span><select className={inputClass} defaultValue={filters.pageSize} name="pageSize"><option value="10">10 per page</option><option value="20">20 per page</option><option value="50">50 per page</option></select></label>
        <div className="flex gap-2 sm:col-span-2 xl:col-span-2 2xl:col-span-2">
          <button className="flex h-11 flex-1 items-center justify-center rounded-xl bg-secondary px-5 text-sm font-black text-white transition hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" type="submit">Apply filters</button>
          <Link aria-label="Clear filters" className="flex size-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary" href="/orders"><X aria-hidden="true" className="size-4.5" /></Link>
        </div>
      </div>
    </form>
  );
}
