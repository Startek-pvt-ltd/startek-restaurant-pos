"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function ExpensesError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { console.error("Expenses route error", error); }, [error]);
  return <section className="rounded-2xl border border-destructive/25 bg-card px-5 py-16 text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle aria-hidden="true" className="size-6" /></span><h1 className="mt-4 text-xl font-black text-secondary">Expenses could not be loaded</h1><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">The database request did not complete. No expense data was changed.</p><button className="mx-auto mt-5 flex h-11 items-center gap-2 rounded-xl bg-secondary px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-primary" onClick={unstable_retry} type="button"><RotateCcw aria-hidden="true" className="size-4" />Try again</button></section>;
}
