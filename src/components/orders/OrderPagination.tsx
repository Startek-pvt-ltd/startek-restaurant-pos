import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { OrderListFilters } from "@/features/orders/types";
import { cn } from "@/lib/utils";

function pageHref(filters: OrderListFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.orderType) params.set("orderType", filters.orderType);
  if (filters.paymentMethod) params.set("paymentMethod", filters.paymentMethod);
  if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.pageSize !== 10) params.set("pageSize", String(filters.pageSize));
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/orders?${query}` : "/orders";
}

export function OrderPagination({ filters, total, totalPages }: { filters: OrderListFilters; total: number; totalPages: number }) {
  if (!total) return null;
  const first = (filters.page - 1) * filters.pageSize + 1;
  const last = Math.min(filters.page * filters.pageSize, total);
  const linkClass = "flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-black text-secondary transition hover:border-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <nav aria-label="Order pagination" className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted-foreground">Showing <strong className="text-secondary">{first}–{last}</strong> of <strong className="text-secondary">{total}</strong> orders</p>
      <div className="flex items-center gap-2">
        <Link aria-disabled={filters.page <= 1} className={cn(linkClass, filters.page <= 1 && "pointer-events-none opacity-45")} href={pageHref(filters, Math.max(1, filters.page - 1))}><ChevronLeft aria-hidden="true" className="size-4" />Previous</Link>
        <span className="px-2 text-xs font-black text-muted-foreground">Page {filters.page} of {totalPages}</span>
        <Link aria-disabled={filters.page >= totalPages} className={cn(linkClass, filters.page >= totalPages && "pointer-events-none opacity-45")} href={pageHref(filters, Math.min(totalPages, filters.page + 1))}>Next<ChevronRight aria-hidden="true" className="size-4" /></Link>
      </div>
    </nav>
  );
}
