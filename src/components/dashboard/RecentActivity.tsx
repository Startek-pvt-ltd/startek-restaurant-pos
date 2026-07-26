import { CircleCheck, Clock3, History } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { relativeDashboardTime } from "@/features/dashboard/formatters";
import type { DashboardActivity } from "@/features/dashboard/types";

export function RecentActivity({ activities }: { activities: DashboardActivity[] }) {
  return <article className="dashboard-card rounded-2xl border border-border/80 bg-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-bold text-foreground">Recent Activity</h2><p className="mt-1 text-xs text-muted-foreground">Latest audited team actions</p></div><CircleCheck aria-hidden="true" className="size-5 text-success" /></div>{!activities.length ? <div className="mt-5"><DashboardEmptyState icon={History} message="No activity has been recorded yet." /></div> : <div className="mt-5 space-y-4">{activities.map((activity) => <div className="flex gap-3" key={activity.id}><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-[0.62rem] font-bold text-white">{activity.initials}</div><div className="min-w-0 flex-1 border-b border-border/70 pb-3 last:border-0 last:pb-0"><p className="truncate text-xs font-bold text-foreground">{activity.user}</p><p className="mt-0.5 line-clamp-2 text-[0.68rem] text-muted-foreground">{activity.action}</p><p className="mt-1.5 flex items-center gap-1 text-[0.62rem] font-medium text-muted-foreground"><Clock3 aria-hidden="true" className="size-3" /> {relativeDashboardTime(activity.createdAt)}</p></div></div>)}</div>}</article>;
}
