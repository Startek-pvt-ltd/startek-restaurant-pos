import { CalendarDays, CalendarRange, ListFilter, SunMedium } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import type { ExpenseStatistics as Statistics } from "@/features/expenses/types";
import { formatMoney } from "@/features/pos/lib/format-money";

export function ExpenseStatistics({ statistics }: { statistics: Statistics }) {
  const cards = [
    { title: "Today", value: formatMoney(Number(statistics.today)), detail: "Expenses dated today", tone: "orange" as const, icon: SunMedium },
    { title: "This Week", value: formatMoney(Number(statistics.week)), detail: "Monday through today", tone: "gold" as const, icon: CalendarRange },
    { title: "This Month", value: formatMoney(Number(statistics.month)), detail: "Month-to-date expenses", tone: "danger" as const, icon: CalendarDays },
    { title: "Filtered Total", value: formatMoney(Number(statistics.filtered)), detail: "Matches the active filters", tone: "brown" as const, icon: ListFilter },
  ];
  return <section aria-label="Expense statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card, index) => <StatCard {...card} delay={index * 45} key={card.title} />)}</section>;
}
