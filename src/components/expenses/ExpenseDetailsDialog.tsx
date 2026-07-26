"use client";

import { Modal } from "@/components/menu/Modal";
import { ExpenseCategoryBadge } from "@/components/expenses/ExpenseCategoryBadge";
import type { ExpenseRecord } from "@/features/expenses/types";
import { formatMoney } from "@/features/pos/lib/format-money";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" });
}

export function ExpenseDetailsDialog({ expense, onClose }: { expense: ExpenseRecord | null; onClose: () => void }) {
  return (
    <Modal description="Complete expense record and audit timestamps." onClose={onClose} open={Boolean(expense)} size="sm" title="Expense details">
      {expense && (
        <div className="space-y-5 p-5 sm:p-6">
          <div className="rounded-2xl bg-secondary p-5 text-white">
            <ExpenseCategoryBadge category={expense.category} />
            <h3 className="mt-3 text-xl font-black">{expense.title}</h3>
            <p className="mt-2 text-2xl font-black text-primary">{formatMoney(Number(expense.amount))}</p>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Expense date</dt><dd className="mt-1 font-bold text-secondary">{expense.expenseDate}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Payment method</dt><dd className="mt-1 font-bold text-secondary">{expense.paymentMethod}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Reference</dt><dd className="mt-1 break-words font-bold text-secondary">{expense.referenceNumber || "Not provided"}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Created by</dt><dd className="mt-1 font-bold text-secondary">{expense.creatorName}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Created</dt><dd className="mt-1 font-bold text-secondary">{formatDateTime(expense.createdAt)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Last updated</dt><dd className="mt-1 font-bold text-secondary">{formatDateTime(expense.updatedAt)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Description</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-secondary">{expense.remarks || "No description provided."}</dd></div>
          </dl>
          <button className="h-11 w-full rounded-xl bg-secondary text-sm font-bold text-white transition hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" onClick={onClose} type="button">Close</button>
        </div>
      )}
    </Modal>
  );
}
