import { ArrowDownRight, ReceiptText } from "lucide-react";
import Link from "next/link";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { formatDashboardDate, formatDashboardMoney, readableEnum } from "@/features/dashboard/formatters";
import type { DashboardExpense } from "@/features/dashboard/types";

export function RecentExpenses({ expenses }: { expenses: DashboardExpense[] }) {
  return <article className="dashboard-card rounded-2xl border border-border/80 bg-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-bold text-foreground">Recent Expenses</h2><p className="mt-1 text-xs text-muted-foreground">Latest operating costs from PostgreSQL</p></div><Link aria-label="View expenses" className="rounded-lg p-2 text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-primary" href="/expenses"><ReceiptText aria-hidden="true" className="size-5" /></Link></div>{!expenses.length ? <div className="mt-5"><DashboardEmptyState icon={ReceiptText} message="No expenses have been recorded yet." /></div> : <div className="mt-5 space-y-3">{expenses.map((expense) => <div className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition hover:border-primary/50 hover:bg-muted/25" key={expense.id}><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/8 text-destructive"><ArrowDownRight aria-hidden="true" className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-foreground">{expense.title}</p><p className="mt-0.5 text-[0.65rem] text-muted-foreground">{readableEnum(expense.category)} · {formatDashboardDate(expense.expenseDate)}</p></div><p className="shrink-0 text-xs font-bold text-destructive">{formatDashboardMoney(expense.amount)}</p></div>)}</div>}</article>;
}
