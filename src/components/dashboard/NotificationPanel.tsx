"use client";

import { Bell, CheckCheck, CircleAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions/notification-actions";

type NotificationItem = Awaited<ReturnType<typeof getNotificationsAction>>["items"][number];

function relativeTime(value: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getNotificationsAction();
      setItems(data.items);
      setUnread(data.unreadCount);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, []);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const markOne = (item: NotificationItem) => {
    if (item.read) return;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
    setUnread((count) => Math.max(0, count - 1));
    startTransition(async () => { await markNotificationReadAction(item.id); });
  };

  const markAll = () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
    startTransition(async () => { await markAllNotificationsReadAction(); });
  };

  return (
    <div className="relative" ref={rootRef}>
      <button aria-expanded={open} aria-haspopup="dialog" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary" onClick={() => setOpen((value) => !value)} type="button">
        <Bell aria-hidden="true" className="size-5" />
        {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.65rem] font-black text-white ring-2 ring-card">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <section aria-label="Notifications" className="absolute right-0 top-12 z-50 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div><h2 className="font-black text-secondary">Notifications</h2><p className="text-xs text-muted-foreground">{unread} unread</p></div>
            <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-secondary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50" disabled={!unread || pending} onClick={markAll} type="button"><CheckCheck aria-hidden="true" className="size-4" />Mark all read</button>
          </div>
          <div className="max-h-[min(28rem,70vh)] overflow-y-auto dashboard-scrollbar">
            {loading ? <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-5 animate-spin" />Loading notifications</div>
              : error ? <div className="p-8 text-center"><CircleAlert aria-hidden="true" className="mx-auto size-6 text-destructive" /><p className="mt-2 text-sm font-bold">Notifications could not be loaded.</p><button className="mt-3 rounded-lg border px-3 py-2 text-xs font-bold focus-visible:ring-2 focus-visible:ring-primary" onClick={() => void load()} type="button">Try again</button></div>
              : !items.length ? <div className="p-10 text-center text-sm text-muted-foreground">You have no notifications yet.</div>
              : items.map((item) => {
                const content = <><span className="flex-1"><span className="block text-sm font-black text-secondary">{item.title}</span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{item.message}</span><span className="mt-1 block text-[0.68rem] font-semibold text-muted-foreground">{relativeTime(item.createdAt)}</span></span>{!item.read && <span aria-label="Unread" className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}</>;
                const className = `flex w-full gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${item.read ? "bg-card" : "bg-primary/5"}`;
                return item.link ? <Link className={className} href={item.link} key={item.id} onClick={() => { markOne(item); setOpen(false); }}>{content}</Link> : <button className={className} key={item.id} onClick={() => markOne(item)} type="button">{content}</button>;
              })}
          </div>
          <Link className="block border-t border-border px-4 py-3 text-center text-xs font-black text-secondary hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary" href="/notifications" onClick={() => setOpen(false)}>View all notifications</Link>
        </section>
      )}
    </div>
  );
}
