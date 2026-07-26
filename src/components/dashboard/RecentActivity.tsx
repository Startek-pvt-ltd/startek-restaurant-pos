import { CircleCheck, Clock3 } from "lucide-react";

const activities = [
  { user: "Kevin Menuja", initials: "KM", action: "Completed order #RKH-1085", time: "4 min ago" },
  { user: "Amali Perera", initials: "AP", action: "Created order #RKH-1084", time: "10 min ago" },
  { user: "Nadeesha Silva", initials: "NS", action: "Recorded the electricity expense", time: "14 min ago" },
  { user: "Kevin Menuja", initials: "KM", action: "Updated receipt printer settings", time: "22 min ago" },
  { user: "Amali Perera", initials: "AP", action: "Updated the Chicken Kottu price", time: "31 min ago" },
];

export function RecentActivity() {
  return (
    <article className="dashboard-card dashboard-fade-in rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent Activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Latest team actions</p>
        </div>
        <CircleCheck aria-hidden="true" className="size-5 text-success" />
      </div>
      <div className="mt-5 space-y-4">
        {activities.map((activity) => (
          <div className="flex gap-3" key={`${activity.user}-${activity.time}`}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-[0.62rem] font-bold text-white">
              {activity.initials}
            </div>
            <div className="min-w-0 flex-1 border-b border-border/70 pb-3 last:border-0 last:pb-0">
              <p className="truncate text-xs font-bold text-foreground">{activity.user}</p>
              <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">{activity.action}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[0.62rem] font-medium text-muted-foreground/75">
                <Clock3 aria-hidden="true" className="size-3" /> {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
