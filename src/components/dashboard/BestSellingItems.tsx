import { Flame } from "lucide-react";

const items = [
  { name: "Chicken Kottu", quantity: 84, revenue: "Rs. 75,600.00", progress: 100 },
  { name: "Cheese Kottu", quantity: 71, revenue: "Rs. 74,550.00", progress: 85 },
  { name: "Chicken Fried Rice", quantity: 63, revenue: "Rs. 56,700.00", progress: 75 },
  { name: "Seafood Noodles", quantity: 58, revenue: "Rs. 69,600.00", progress: 69 },
  { name: "Mixed Rice", quantity: 46, revenue: "Rs. 48,300.00", progress: 55 },
];

export function BestSellingItems() {
  return (
    <article className="dashboard-card dashboard-fade-in rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Best-Selling Items</h2>
          <p className="mt-1 text-xs text-muted-foreground">Top menu performance today</p>
        </div>
        <Flame aria-hidden="true" className="size-5 text-accent" />
      </div>
      <ol className="mt-5 space-y-4">
        {items.map((item, index) => (
          <li className="flex items-center gap-3" key={item.name}>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-[0.65rem] font-bold text-secondary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs font-bold text-foreground">{item.name}</p>
                <p className="shrink-0 text-[0.65rem] font-bold text-secondary">{item.quantity} sold</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${item.progress}%` }} />
              </div>
              <p className="mt-1 text-[0.62rem] text-muted-foreground">{item.revenue}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
