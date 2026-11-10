"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { printReceiptWhenReady } from "./print-receipt";

export function PrintButton() {
  const [printing, setPrinting] = useState(false);
  const print = async () => {
    if (printing) return;
    setPrinting(true);
    try { await printReceiptWhenReady(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Receipt could not be prepared for printing."); }
    finally { setPrinting(false); }
  };
  return <button className="flex h-10 items-center gap-1.5 rounded-xl bg-secondary px-4 text-xs font-black text-white focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60" disabled={printing} onClick={print} type="button"><Printer aria-hidden="true" className="size-4" />{printing ? "Preparing…" : "Print receipt"}</button>;
}
