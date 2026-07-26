"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function DashboardError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { console.error("Dashboard rendering failed", error); }, [error]);
  return <main className="flex min-h-screen items-center justify-center bg-background p-5"><section className="w-full max-w-lg rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-xl"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><CircleAlert aria-hidden="true" className="size-7" /></span><h1 className="mt-5 text-2xl font-black text-foreground">Dashboard unavailable</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Live restaurant statistics could not be loaded. No database details were exposed. Check the connection and try again.</p><button className="mx-auto mt-6 flex h-11 items-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-white transition hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" onClick={() => unstable_retry()} type="button"><RefreshCw aria-hidden="true" className="size-4" />Try again</button></section></main>;
}
