import { Filter, Search, X } from "lucide-react";
import Link from "next/link";

import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseListFilters,
} from "@/features/expenses/types";

const inputClass = "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm font-semibold text-secondary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

export function ExpenseFilters({ error, filters }: { error?: string; filters: ExpenseListFilters }) {
  return (
    <form className="dashboard-card rounded-2xl border border-border bg-card p-4" method="get">
      <div className="mb-4 flex items-center gap-2"><Filter aria-hidden="true" className="size-4.5 text-primary" /><h2 className="font-black text-secondary">Find and filter expenses</h2></div>
      {error && <p className="mb-4 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <label className="relative sm:col-span-2"><span className="sr-only">Search title, reference, or description</span><Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className={`${inputClass} pl-10`} defaultValue={filters.query} maxLength={100} name="query" placeholder="Title, reference, description…" type="search" /></label>
        <label><span className="sr-only">Expense category</span><select className={inputClass} defaultValue={filters.category ?? ""} name="category"><option value="">All categories</option>{EXPENSE_CATEGORIES.map((category) => <option key={category} value={category}>{EXPENSE_CATEGORY_LABELS[category]}</option>)}</select></label>
        <label><span className="mb-1 block text-[0.68rem] font-black uppercase tracking-wide text-muted-foreground">Start date</span><input className={inputClass} defaultValue={filters.dateFrom} name="dateFrom" type="date" /></label>
        <label><span className="mb-1 block text-[0.68rem] font-black uppercase tracking-wide text-muted-foreground">End date</span><input className={inputClass} defaultValue={filters.dateTo} name="dateTo" type="date" /></label>
        <label><span className="sr-only">Sort expenses</span><select className={inputClass} defaultValue={filters.sort} name="sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="amount-high">Highest amount</option><option value="amount-low">Lowest amount</option></select></label>
        <label><span className="sr-only">Rows per page</span><select className={inputClass} defaultValue={filters.pageSize} name="pageSize"><option value="10">10 per page</option><option value="20">20 per page</option><option value="50">50 per page</option></select></label>
        <div className="flex gap-2 sm:col-span-2 xl:col-span-2"><button className="flex h-11 flex-1 items-center justify-center rounded-xl bg-secondary px-5 text-sm font-black text-white transition hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" type="submit">Apply filters</button><Link aria-label="Clear filters" className="flex size-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary" href="/expenses"><X aria-hidden="true" className="size-4.5" /></Link></div>
      </div>
    </form>
  );
}
