import { Banknote, CheckCircle2, CircleX, Clock3, ShoppingBag } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { formatMoney } from "@/features/pos/lib/format-money";
import type { OrderStatistics as Statistics } from "@/features/orders/types";

export function OrderStatistics({ statistics }: { statistics: Statistics }) {
  const cards = [
    { title: "Orders today", value: String(statistics.ordersToday), detail: "All orders created today", tone: "gold" as const, icon: ShoppingBag },
    { title: "Completed today", value: String(statistics.completedToday), detail: "Successfully completed", tone: "success" as const, icon: CheckCircle2 },
    { title: "Pending orders", value: String(statistics.pendingOrders), detail: "Awaiting completion", tone: "orange" as const, icon: Clock3 },
    { title: "Cancelled today", value: String(statistics.cancelledToday), detail: "Retained in order history", tone: "danger" as const, icon: CircleX },
    { title: "Total sales today", value: formatMoney(Number(statistics.totalSalesToday)), detail: "Completed order value", tone: "brown" as const, icon: Banknote },
  ];

  return (
    <section aria-label="Order statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => <StatCard {...card} delay={index * 45} key={card.title} />)}
    </section>
  );
}
