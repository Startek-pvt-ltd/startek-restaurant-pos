import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { StaffFilters } from "@/features/staff/types";
import { cn } from "@/lib/utils";

function href(filters: StaffFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  params.set("sort", filters.sort);
  params.set("pageSize", String(filters.pageSize));
  params.set("page", String(page));
  return `/staff?${params}`;
}

export function StaffPagination({ filters, page, total, totalPages }: { filters: StaffFilters; page: number; total: number; totalPages: number }) {
  const itemClass = "flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold text-secondary transition hover:border-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary";
  return <nav aria-label="Staff pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row"><p className="text-sm text-muted-foreground">{total} staff account{total === 1 ? "" : "s"} · Page {page} of {totalPages}</p><div className="flex gap-2"><Link aria-disabled={page <= 1} className={cn(itemClass, page <= 1 && "pointer-events-none opacity-45")} href={href(filters, Math.max(1, page - 1))}><ChevronLeft aria-hidden="true" className="size-4" />Previous</Link><Link aria-disabled={page >= totalPages} className={cn(itemClass, page >= totalPages && "pointer-events-none opacity-45")} href={href(filters, Math.min(totalPages, page + 1))}>Next<ChevronRight aria-hidden="true" className="size-4" /></Link></div></nav>;
}
