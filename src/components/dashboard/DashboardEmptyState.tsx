import type { LucideIcon } from "lucide-react";

export function DashboardEmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center"><Icon aria-hidden="true" className="size-7 text-muted-foreground" /><p className="mt-3 text-sm font-semibold text-muted-foreground">{message}</p></div>;
}
