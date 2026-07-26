"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function StaffError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { console.error("Staff route failed", error); }, [error]);
  return <section className="rounded-3xl border border-destructive/20 bg-card px-5 py-16 text-center"><TriangleAlert aria-hidden="true" className="mx-auto size-10 text-destructive" /><h1 className="mt-4 text-xl font-black text-secondary">Staff accounts could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">No account data was changed. Please retry.</p><button className="mt-5 h-11 rounded-xl bg-secondary px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-primary" onClick={() => unstable_retry()} type="button">Try again</button></section>;
}
