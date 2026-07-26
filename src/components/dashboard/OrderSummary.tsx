import { CheckCircle2, CircleEllipsis, ClipboardList, XCircle } from "lucide-react";

export function OrderSummary({ data }: { data: { completed: number; pending: number; cancelled: number; total: number } }) {
  const rows = [
    { label: "Completed", value: data.completed, icon: CheckCircle2, tone: "text-success bg-success/10" },
    { label: "Pending", value: data.pending, icon: CircleEllipsis, tone: "text-accent bg-accent/10" },
    { label: "Cancelled", value: data.cancelled, icon: XCircle, tone: "text-destructive bg-destructive/10" },
  ];
  return <article className="dashboard-card rounded-2xl border border-border/80 bg-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-foreground">Today&apos;s Orders</h2><p className="mt-1 text-xs text-muted-foreground">Live status distribution</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><ClipboardList aria-hidden="true" className="size-5" /></span></div><div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">{rows.map(({ label, value, icon: Icon, tone }) => <div className="flex items-center gap-3 rounded-xl border border-border/70 p-3" key={label}><span className={`flex size-9 items-center justify-center rounded-lg ${tone}`}><Icon aria-hidden="true" className="size-4" /></span><div><p className="text-lg font-black text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div><p className="mt-4 border-t border-border pt-3 text-xs font-semibold text-muted-foreground">{data.total} total orders recorded today</p></article>;
}
