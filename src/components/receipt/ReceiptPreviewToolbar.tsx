"use client";

import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { PrintButton } from "./PrintButton";

export function ReceiptPreviewToolbar({ autoPrint, copies, orderId, printerName }: { autoPrint: boolean; copies: number; orderId: string; printerName: string }) {
  const opened = useRef(false);
  useEffect(() => { if (!autoPrint || opened.current) return; opened.current = true; const frame = window.requestAnimationFrame(() => window.print()); return () => window.cancelAnimationFrame(frame); }, [autoPrint]);
  return <div className="no-print mx-auto mb-5 flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"><div><p className="text-sm font-black text-secondary">Receipt preview · {printerName}</p><p className="mt-1 text-xs text-muted-foreground">Select 80 mm roll paper, 100% scale, portrait orientation, zero margins, and disable browser headers and footers. Enable “Cut after document” in Windows printer preferences. This job contains {copies} {copies === 1 ? "copy" : "copies"}.</p></div><div className="flex flex-wrap gap-2"><Link className="flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-black text-secondary focus-visible:ring-2 focus-visible:ring-primary" href={`/orders/${orderId}`}><ArrowLeft aria-hidden="true" className="size-4" />Order details</Link><Link className="flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-black text-secondary focus-visible:ring-2 focus-visible:ring-primary" href="/pos"><ShoppingCart aria-hidden="true" className="size-4" />Return to POS</Link><PrintButton /></div></div>;
}
