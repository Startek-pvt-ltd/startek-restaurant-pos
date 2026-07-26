import type { ExpenseCategory } from "@/generated/prisma/client";
import { EXPENSE_CATEGORY_LABELS } from "@/features/expenses/types";

export function ExpenseCategoryBadge({ category }: { category: ExpenseCategory }) {
  return (
    <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wide text-secondary">
      {EXPENSE_CATEGORY_LABELS[category]}
    </span>
  );
}
