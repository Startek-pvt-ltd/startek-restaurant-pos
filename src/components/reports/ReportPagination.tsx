import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { ReportFilters } from "@/features/reports/types";
import { cn } from "@/lib/utils";

export function reportQuery(filters: ReportFilters, page?: number) {
  const params = new URLSearchParams();
  params.set("preset", filters.preset);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.query) params.set("query", filters.query);
  for (const key of ["cashierId", "orderType", "paymentMethod", "status", "categoryId", "menuItemId", "expenseCategory"] as const) if (filters[key]) params.set(key, String(filters[key]));
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.pageSize !== 10) params.set("pageSize", String(filters.pageSize));
  if ((page ?? filters.page) > 1) params.set("page", String(page ?? filters.page));
  return params.toString();
}

export function ReportPagination({ filters, page, route, total, totalPages }: { filters: ReportFilters; page: number; route: string; total: number; totalPages: number }) {
  if (!total) return null;
  const linkClass = "flex h-10 items-center gap-1 rounded-xl border border-border bg-card px-3 text-sm font-black text-secondary transition hover:border-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary";
  return <nav aria-label="Report pagination" className="no-print flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-muted-foreground">Page {page} of {totalPages} · {total} records</p><div className="flex gap-2"><Link aria-disabled={page <= 1} className={cn(linkClass, page <= 1 && "pointer-events-none opacity-45")} href={`${route}?${reportQuery(filters, Math.max(1, page - 1))}`}><ChevronLeft aria-hidden="true" className="size-4" />Previous</Link><Link aria-disabled={page >= totalPages} className={cn(linkClass, page >= totalPages && "pointer-events-none opacity-45")} href={`${route}?${reportQuery(filters, Math.min(totalPages, page + 1))}`}>Next<ChevronRight aria-hidden="true" className="size-4" /></Link></div></nav>;
}
