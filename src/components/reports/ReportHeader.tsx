import { BarChart3 } from "lucide-react";

export function ReportHeader({ description, rangeLabel, title }: { description: string; rangeLabel: string; title: string }) {
  return <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><BarChart3 aria-hidden="true" className="size-4" />Reports &amp; Analytics</div><h1 className="mt-2 text-2xl font-black tracking-tight text-secondary sm:text-3xl">{title}</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p></div><span className="print-date-range rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-black text-secondary">{rangeLabel}</span></header>;
}
