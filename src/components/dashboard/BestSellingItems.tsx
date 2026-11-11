import { Flame } from "lucide-react";

export function BestSellingItems({ items }: { items: Array<{ id: string; name: string; quantity: number; revenue: string; progress: number }> }) {
  return (
    <article className="dashboard-card dashboard-fade-in rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Best-Selling Items</h2>
          <p className="mt-1 text-xs text-muted-foreground">Top menu performance today</p>
        </div>
        <Flame aria-hidden="true" className="size-5 text-accent" />
      </div>
      {items.length === 0 && <p className="mt-5 text-sm text-muted-foreground">No completed sales today.</p>}
      <ol className="mt-5 space-y-4">
        {items.map((item, index) => (
          <li className="flex items-center gap-3" key={item.id}>
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
