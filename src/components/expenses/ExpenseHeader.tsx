"use client";

import { CircleDollarSign, Plus } from "lucide-react";
import { useState } from "react";

import { ExpenseFormDialog } from "./ExpenseFormDialog";

export function ExpenseHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><CircleDollarSign aria-hidden="true" className="size-4" />Financial records</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-secondary sm:text-3xl">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Record, review, and control restaurant operating expenses.</p>
        </div>
        <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-secondary shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e8aa00] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" onClick={() => setOpen(true)} type="button"><Plus aria-hidden="true" className="size-4.5" />Add Expense</button>
      </header>
      <ExpenseFormDialog expense={null} onClose={() => setOpen(false)} open={open} />
    </>
  );
}
