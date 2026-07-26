import { Bell, BellRing } from "lucide-react";
import Link from "next/link";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { relativeDashboardTime } from "@/features/dashboard/formatters";
import type { DashboardNotification } from "@/features/dashboard/types";

export function DashboardNotifications({ items, unreadCount }: { items: DashboardNotification[]; unreadCount: number }) {
  return <article className="dashboard-card rounded-2xl border border-border/80 bg-card p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-foreground">Notifications</h2><p className="mt-1 text-xs text-muted-foreground">{unreadCount} unread operational updates</p></div><Link aria-label="View all notifications" className="relative flex size-10 items-center justify-center rounded-xl bg-primary/15 text-secondary focus-visible:ring-2 focus-visible:ring-primary" href="/notifications"><BellRing aria-hidden="true" className="size-5" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1 text-center text-[0.6rem] font-black text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}</Link></div>{!items.length ? <div className="mt-5"><DashboardEmptyState icon={Bell} message="No notifications have been recorded yet." /></div> : <ul className="mt-4 divide-y divide-border">{items.map((item) => <li key={item.id}>{item.link ? <Link className="flex gap-3 rounded-lg py-3 transition hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-primary" href={item.link}><NotificationContent item={item} /></Link> : <div className="flex gap-3 py-3"><NotificationContent item={item} /></div>}</li>)}</ul>}</article>;
}

function NotificationContent({ item }: { item: DashboardNotification }) {
  return <><span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.read ? "bg-border" : "bg-primary"}`} /><span className="min-w-0"><span className="block truncate text-xs font-bold text-foreground">{item.title}</span><span className="mt-0.5 line-clamp-2 block text-[0.68rem] leading-5 text-muted-foreground">{item.message}</span><span className="mt-1 block text-[0.62rem] font-semibold text-muted-foreground">{relativeDashboardTime(item.createdAt)}</span></span></>;
}
