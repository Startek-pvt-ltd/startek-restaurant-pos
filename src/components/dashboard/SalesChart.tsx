"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  border: "1px solid #f0dfbd",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(74,35,16,0.12)",
  fontSize: "12px",
};

export function SalesChart({ data }: { data: Array<{ label: string; value: string }> }) {
  const weeklySales = data.map((item) => ({ day: item.label, sales: Number(item.value) }));
  return (
    <article className="dashboard-card dashboard-fade-in rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Weekly Sales Overview</h2>
          <p className="mt-1 text-xs text-muted-foreground">Completed daily sales from PostgreSQL</p>
        </div>
        <span className="rounded-lg bg-muted px-2.5 py-1 text-[0.65rem] font-bold text-muted-foreground">THIS WEEK</span>
      </div>

      <div aria-label="Weekly sales chart" className="h-72 w-full" role="img">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={weeklySales} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklySalesGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#F4B400" stopOpacity={0.42} />
                <stop offset="95%" stopColor="#F4B400" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f4ead4" strokeDasharray="3 3" vertical={false} />
            <XAxis axisLine={false} dataKey="day" fontSize={11} tickLine={false} />
            <YAxis
              axisLine={false}
              fontSize={11}
              tickFormatter={(value) => `${Number(value) / 1000}k`}
              tickLine={false}
              width={38}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`Rs. ${Number(value).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, "Sales"]}
            />
            <Area
              dataKey="sales"
              fill="url(#weeklySalesGradient)"
              stroke="#F4B400"
              strokeWidth={3}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
