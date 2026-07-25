"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";

export function ExportActions({ query, report }: { query: string; report: string }) {
  const suffix = query ? `?${query}&` : "?";
  const buttonClass = "flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-black text-secondary transition hover:border-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary";
  return <div className="no-print flex flex-wrap gap-2" aria-label="Report export actions"><a className={buttonClass} href={`/reports/export/${report}${suffix}format=csv`}><Download aria-hidden="true" className="size-4" />CSV</a><a className={buttonClass} href={`/reports/export/${report}${suffix}format=xlsx`}><FileSpreadsheet aria-hidden="true" className="size-4" />Excel</a><button className={buttonClass} onClick={() => window.print()} type="button"><Printer aria-hidden="true" className="size-4" />Print / Save PDF</button></div>;
}
