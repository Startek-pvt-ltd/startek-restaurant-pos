import {
  BadgeDollarSign,
  CircleDollarSign,
  FileChartColumn,
  Plus,
  ReceiptText,
  ShoppingBag,
  Tags,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { BestSellingItems } from "@/components/dashboard/BestSellingItems";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PaymentChart } from "@/components/dashboard/PaymentChart";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { requireAuth } from "@/lib/auth-utils";
import { getDashboardAnalytics } from "@/features/reports/services/dashboard-analytics-service";
import { formatReportMoney } from "@/features/reports/utils/report-formatters";

const quickActions = [
  { label: "New Order", description: "Start POS billing", icon: Plus, emphasized: true, href: "/pos" },
  { label: "Add Menu Item", description: "Create a new dish", icon: ShoppingBag, href: "/menu?action=new" },
  { label: "Manage Categories", description: "Organize the menu", icon: Tags, href: "/menu/categories" },
  { label: "Add Expense", description: "Open expense workspace", icon: ReceiptText, href: "/expenses" },
  { label: "View Reports", description: "Open report workspace", icon: FileChartColumn, href: "/reports" },
];

export default async function DashboardPage() {
  const [session, analytics] = await Promise.all([requireAuth(), getDashboardAnalytics()]);
  const fullName = session.user.name ?? session.user.username;
  const currentHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Asia/Colombo",
    }).format(new Date()),
  );
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";
  const stats = [
    { title: "Today's Sales", value: formatReportMoney(analytics.todaySales), detail: "Completed sales today", tone: "gold" as const, icon: CircleDollarSign },
    { title: "Today's Orders", value: String(analytics.todayOrders), detail: "All orders created today", tone: "orange" as const, icon: ShoppingBag },
    { title: "Monthly Revenue", value: formatReportMoney(analytics.monthRevenue), detail: "Completed sales this month", tone: "brown" as const, icon: WalletCards },
    { title: "Average Order Value", value: formatReportMoney(analytics.averageOrder), detail: "Completed monthly average", tone: "success" as const, icon: TrendingUp },
    { title: "Total Expenses", value: formatReportMoney(analytics.monthExpenses), detail: "Recorded this month", tone: "danger" as const, icon: ReceiptText },
    { title: "Estimated Net Revenue", value: formatReportMoney(analytics.netRevenue), detail: "Monthly sales minus expenses", tone: "success" as const, icon: BadgeDollarSign },
  ];

  return (
    <DashboardShell user={{ fullName, role: session.user.role }}>
      <div className="space-y-7 pb-8">
        <WelcomeSection fullName={fullName} greeting={greeting} />

        <section aria-label="Quick actions" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {quickActions.map((action) => (
            <QuickAction key={action.label} {...action} />
          ))}
        </section>

        <section aria-label="Business statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} delay={index * 45} />
          ))}
        </section>

        <section aria-label="Sales charts" className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
          <SalesChart data={analytics.weeklySales} />
          <PaymentChart data={analytics.payments} />
        </section>

        <RecentOrders />

        <section className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          <BestSellingItems />
          <RecentExpenses />
          <RecentActivity />
        </section>
      </div>
    </DashboardShell>
  );
}
