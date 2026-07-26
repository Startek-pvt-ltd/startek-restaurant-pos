import { Banknote, Clock } from "lucide-react";
import Link from "next/link";
import { formatDashboardMoney, relativeDashboardTime } from "@/features/dashboard/formatters";

type ActiveRegister = { id:string; openedBy:string; openedAt:string; openingCash:string; expectedCash:string };

export function CashDrawerSummary({ data }: { data: ActiveRegister | null }) {
  return <article className="dashboard-card rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
    <div className="flex items-center justify-between"><div><h2 className="font-bold text-foreground">Cash Register</h2><p className="mt-1 text-xs text-muted-foreground">Live register session</p></div><Banknote aria-hidden="true" className={data?"size-5 text-success":"size-5 text-muted-foreground"}/></div>
    {data ? <><p className="mt-5 text-xs font-black uppercase tracking-wider text-success">Register Open</p><p className="mt-2 text-3xl font-black">{formatDashboardMoney(data.expectedCash)}</p><p className="text-xs text-muted-foreground">Expected physical cash</p><dl className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-muted/35 p-3"><dt className="text-xs text-muted-foreground">Opening cash</dt><dd className="mt-1 font-black">{formatDashboardMoney(data.openingCash)}</dd></div><div className="rounded-xl bg-muted/35 p-3"><dt className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3"/>Current cashier</dt><dd className="mt-1 truncate font-black">{data.openedBy}</dd><p className="mt-1 text-[0.65rem] text-muted-foreground">Open {relativeDashboardTime(data.openedAt)}</p></div></dl></> : <><p className="mt-7 text-xl font-black">Register Closed</p><p className="mt-2 text-sm text-muted-foreground">Open a cash session before processing orders.</p></>}
    <Link className="mt-5 flex h-10 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-white" href="/cash-closing">{data?"View / Close Register":"Open Register"}</Link>
  </article>;
}
