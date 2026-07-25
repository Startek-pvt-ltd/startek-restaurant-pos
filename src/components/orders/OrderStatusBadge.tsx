import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
  PAID: "border-green-200 bg-green-50 text-green-700",
  REFUNDED: "border-violet-200 bg-violet-50 text-violet-700",
};

export function OrderStatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wide",
        tones[value] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
