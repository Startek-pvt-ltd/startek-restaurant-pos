import { Bell } from "lucide-react";

import { getUserNotifications } from "@/features/notifications/services/notification-service";
import { requireAuth } from "@/lib/auth-utils";

export default async function NotificationsPage() {
  const session = await requireAuth();
  const { items } = await getUserNotifications(session.user.id, 100);
  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-8">
      <div><h1 className="text-2xl font-black text-secondary">Notifications</h1><p className="mt-1 text-sm text-muted-foreground">Recent operational updates for your account.</p></div>
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {!items.length ? <div className="p-14 text-center"><Bell aria-hidden="true" className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-bold text-secondary">No notifications yet</p></div> : <ul className="divide-y divide-border">{items.map((item) => <li className={item.read ? "p-4" : "bg-primary/5 p-4"} key={item.id}><div className="flex items-start gap-3"><span className={`mt-1 size-2 shrink-0 rounded-full ${item.read ? "bg-border" : "bg-primary"}`} /><div><p className="font-black text-secondary">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.message}</p><time className="mt-2 block text-xs font-semibold text-muted-foreground" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" })}</time></div></div></li>)}</ul>}
      </section>
    </div>
  );
}
