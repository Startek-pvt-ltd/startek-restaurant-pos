import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        active ? "bg-success/12 text-green-700" : "bg-destructive/10 text-red-700",
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-destructive")} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

