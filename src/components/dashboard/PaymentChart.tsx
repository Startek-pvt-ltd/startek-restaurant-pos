"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const payments = [
  { name: "Cash", value: 58, color: "#F4B400" },
  { name: "Card", value: 29, color: "#4A2310" },
  { name: "QR", value: 13, color: "#F97316" },
];

export function PaymentChart() {
  return (
    <article className="dashboard-card dashboard-fade-in rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Payment Methods</h2>
        <p className="mt-1 text-xs text-muted-foreground">Today&apos;s mock payment distribution</p>
      </div>

      <div aria-label="Payment method distribution chart" className="relative mt-2 h-72 w-full" role="img">
        <div className="pointer-events-none absolute inset-x-0 top-[6.3rem] z-10 text-center">
          <p className="text-2xl font-bold text-foreground">86</p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Payments</p>
        </div>
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              data={payments}
              dataKey="value"
              innerRadius={64}
              nameKey="name"
              outerRadius={96}
              paddingAngle={4}
              stroke="none"
            >
              {payments.map((entry) => (
                <Cell fill={entry.color} key={entry.name} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                border: "1px solid #f0dfbd",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(74,35,16,0.12)",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value}%`, "Share"]}
            />
            <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
