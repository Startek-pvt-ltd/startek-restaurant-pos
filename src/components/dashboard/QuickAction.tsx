import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface QuickActionProps {
  label: string;
  description: string;
  icon: LucideIcon;
  emphasized?: boolean;
  href?: string;
}

export function QuickAction({ label, description, icon: Icon, emphasized = false, href }: QuickActionProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105",
          emphasized ? "bg-secondary text-white" : "bg-muted text-secondary",
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-bold">{label}</span>
        <span className={cn("hidden truncate text-[0.65rem] xl:block", emphasized ? "text-secondary/65" : "text-muted-foreground")}>
          {description}
        </span>
      </span>
    </>
  );
  const className = cn(
        "group flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        emphasized
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/60",
      );

  return href ? <Link className={className} href={href}>{content}</Link> : <button className={className} type="button">{content}</button>;
}
