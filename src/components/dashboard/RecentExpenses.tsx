import { ArrowDownRight, ReceiptText } from "lucide-react";

const expenses = [
  { title: "Gas", category: "Utilities", amount: "Rs. 8,500.00", date: "Today" },
  { title: "Electricity", category: "Utilities", amount: "Rs. 24,750.00", date: "Today" },
  { title: "Chicken Purchase", category: "Purchases", amount: "Rs. 36,800.00", date: "Yesterday" },
  { title: "Packaging", category: "Operations", amount: "Rs. 7,250.00", date: "Yesterday" },
  { title: "Staff Meals", category: "Staff", amount: "Rs. 5,600.00", date: "24 Jul" },
];

export function RecentExpenses() {
  return (
    <article className="dashboard-card dashboard-fade-in rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent Expenses</h2>
          <p className="mt-1 text-xs text-muted-foreground">Latest operating costs</p>
        </div>
        <ReceiptText aria-hidden="true" className="size-5 text-destructive" />
      </div>

      <div className="mt-5 space-y-3">
        {expenses.map((expense) => (
          <div className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition hover:border-primary/50 hover:bg-muted/25" key={expense.title}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/8 text-destructive">
              <ArrowDownRight aria-hidden="true" className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground">{expense.title}</p>
              <p className="mt-0.5 text-[0.65rem] text-muted-foreground">{expense.category} · {expense.date}</p>
            </div>
            <p className="shrink-0 text-xs font-bold text-destructive">{expense.amount}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
