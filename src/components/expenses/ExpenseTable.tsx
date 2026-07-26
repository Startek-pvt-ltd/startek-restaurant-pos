"use client";

import { CircleDollarSign, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/menu/ConfirmDialog";
import { deleteExpenseAction } from "@/features/expenses/actions/expense-actions";
import type { ExpenseRecord } from "@/features/expenses/types";
import { formatMoney } from "@/features/pos/lib/format-money";

import { ExpenseCategoryBadge } from "./ExpenseCategoryBadge";
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog";
import { ExpenseFormDialog } from "./ExpenseFormDialog";

function formatDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-LK", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}

function ActionButtons({ canDelete, canEdit, expense, onDelete, onEdit, onView }: { canDelete: boolean; canEdit: boolean; expense: ExpenseRecord; onDelete: () => void; onEdit: () => void; onView: () => void }) {
  const buttonClass = "flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary";
  return <div className="flex items-center justify-end gap-2"><button aria-label={`View ${expense.title}`} className={buttonClass} onClick={onView} type="button"><Eye aria-hidden="true" className="size-4" /></button>{canEdit && <button aria-label={`Edit ${expense.title}`} className={buttonClass} onClick={onEdit} type="button"><Pencil aria-hidden="true" className="size-4" /></button>}{canDelete && <button aria-label={`Delete ${expense.title}`} className={`${buttonClass} hover:border-destructive/30 hover:bg-destructive/8 hover:text-destructive focus-visible:ring-destructive`} onClick={onDelete} type="button"><Trash2 aria-hidden="true" className="size-4" /></button>}</div>;
}

export function ExpenseTable({ canDelete, canEditAll, currentUserId, expenses }: { canDelete: boolean; canEditAll: boolean; currentUserId: string; expenses: ExpenseRecord[] }) {
  const router = useRouter();
  const [viewing, setViewing] = useState<ExpenseRecord | null>(null);
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);
  const [deleting, setDeleting] = useState<ExpenseRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteExpenseAction(deleting.id, deleting.updatedAt);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleting(null);
      router.refresh();
    });
  };

  if (!expenses.length) {
    return <section className="rounded-2xl border border-dashed border-input bg-card px-5 py-16 text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><CircleDollarSign aria-hidden="true" className="size-6" /></span><h2 className="mt-4 text-lg font-black text-secondary">No expenses found</h2><p className="mt-1 text-sm text-muted-foreground">Add the first expense or change the current filters.</p></section>;
  }

  return (
    <>
      <section aria-label="Expenses" className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_32px_rgba(74,35,16,0.07)]">
        <div className="divide-y divide-border md:hidden">
          {expenses.map((expense) => <article className="space-y-3 p-4" key={expense.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-black text-secondary">{expense.title}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(expense.expenseDate)}</p></div><ExpenseCategoryBadge category={expense.category} /></div><dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm"><div><dt className="text-xs text-muted-foreground">Reference</dt><dd className="truncate font-bold text-secondary">{expense.referenceNumber || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Created by</dt><dd className="truncate font-bold text-secondary">{expense.creatorName}</dd></div></dl><div className="flex items-center justify-between gap-3 border-t border-border pt-3"><p className="whitespace-nowrap text-base font-black text-secondary">{formatMoney(Number(expense.amount))}</p><ActionButtons canDelete={canDelete} canEdit={canEditAll || expense.createdBy === currentUserId} expense={expense} onDelete={() => setDeleting(expense)} onEdit={() => setEditing(expense)} onView={() => setViewing(expense)} /></div></article>)}
        </div>
        <div className="hidden overflow-x-auto md:block dashboard-scrollbar">
          <table className="w-full min-w-[980px] border-collapse text-left"><thead className="bg-secondary text-[0.68rem] uppercase tracking-wider text-white/70"><tr>{["Date", "Title", "Category", "Reference", "Created By", "Amount", "Actions"].map((heading) => <th className={`px-4 py-3.5 font-black ${heading === "Amount" || heading === "Actions" ? "text-right" : ""}`} key={heading} scope="col">{heading}</th>)}</tr></thead><tbody className="divide-y divide-border">{expenses.map((expense) => <tr className="transition hover:bg-muted/35" key={expense.id}><td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-muted-foreground">{formatDate(expense.expenseDate)}</td><td className="max-w-64 px-4 py-4"><p className="truncate text-sm font-black text-secondary">{expense.title}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{expense.remarks || "No description"}</p></td><td className="px-4 py-4"><ExpenseCategoryBadge category={expense.category} /></td><td className="max-w-48 truncate px-4 py-4 text-sm font-semibold text-secondary">{expense.referenceNumber || "—"}</td><td className="px-4 py-4 text-sm font-semibold text-secondary">{expense.creatorName}</td><td className="whitespace-nowrap px-4 py-4 text-right text-sm font-black text-secondary">{formatMoney(Number(expense.amount))}</td><td className="px-4 py-4"><ActionButtons canDelete={canDelete} canEdit={canEditAll || expense.createdBy === currentUserId} expense={expense} onDelete={() => setDeleting(expense)} onEdit={() => setEditing(expense)} onView={() => setViewing(expense)} /></td></tr>)}</tbody></table>
        </div>
      </section>
      <ExpenseDetailsDialog expense={viewing} onClose={() => setViewing(null)} />
      <ExpenseFormDialog expense={editing} onClose={() => setEditing(null)} open={Boolean(editing)} />
      <ConfirmDialog confirmLabel="Delete expense" description={`Permanently delete ${deleting?.title ?? "this expense"}? The expense details will be written to the activity log first. This action cannot be undone.`} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} open={Boolean(deleting)} pending={isPending} title="Delete expense" />
    </>
  );
}
