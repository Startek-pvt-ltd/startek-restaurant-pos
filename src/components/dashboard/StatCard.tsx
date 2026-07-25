import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  gold: "bg-primary/14 text-[#b57900]",
  orange: "bg-accent/12 text-accent",
  danger: "bg-destructive/10 text-destructive",
  brown: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
};

interface StatCardProps {
  title: string;
  value: string;
  detail: string;
  tone: keyof typeof tones;
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ title, value, detail, tone, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <article
      className="dashboard-card dashboard-fade-in group min-w-0 rounded-2xl border border-border/80 bg-card p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105", tones[tone])}>
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>
      <p className="mt-4 truncate text-[0.7rem] font-medium text-muted-foreground">{detail}</p>
    </article>
  );
}
