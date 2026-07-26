import type { LucideIcon } from "lucide-react";

export function ReportStatCard({ detail, icon: Icon, title, value }: { detail: string; icon: LucideIcon; title: string; value: string }) {
  return <article className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold text-muted-foreground">{title}</p><p className="mt-2 break-words text-xl font-black text-secondary">{value}</p></div><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-[#a86f00]"><Icon aria-hidden="true" className="size-5" /></span></div><p className="mt-3 text-[0.68rem] font-semibold text-muted-foreground">{detail}</p></article>;
}
