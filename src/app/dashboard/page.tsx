import {
  BadgeDollarSign,
  CircleDollarSign,
  FileChartColumn,
  Plus,
  ReceiptText,
  ShoppingBag,
  UserPlus,
  UsersRound,
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

const stats = [
  {
    title: "Today's Sales",
    value: "Rs. 48,500.00",
    detail: "+12.5% from yesterday",
    tone: "gold" as const,
    icon: CircleDollarSign,
  },
  {
    title: "Today's Orders",
    value: "86",
    detail: "14 orders this hour",
    tone: "orange" as const,
    icon: ShoppingBag,
  },
  {
    title: "Monthly Revenue",
    value: "Rs. 1,284,750.00",
    detail: "+8.2% from last month",
    tone: "brown" as const,
    icon: WalletCards,
  },
  {
    title: "Total Customers",
    value: "1,248",
    detail: "+36 new this month",
    tone: "success" as const,
    icon: UsersRound,
  },
  {
    title: "Total Expenses",
    value: "Rs. 186,420.00",
    detail: "Current month total",
    tone: "danger" as const,
    icon: ReceiptText,
  },
  {
    title: "Net Sales",
    value: "Rs. 1,098,330.00",
    detail: "+9.4% monthly growth",
    tone: "success" as const,
    icon: BadgeDollarSign,
  },
];

const quickActions = [
  { label: "New Order", description: "Start POS billing", icon: Plus, emphasized: true },
  { label: "Add Menu Item", description: "Create a new dish", icon: ShoppingBag },
  { label: "Add Customer", description: "Register a customer", icon: UserPlus },
  { label: "Add Expense", description: "Record a cost", icon: ReceiptText },
  { label: "View Reports", description: "Open sales reports", icon: FileChartColumn },
];

export default async function DashboardPage() {
  const session = await requireAuth();
  const fullName = session.user.name ?? session.user.username;
  const currentHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Asia/Colombo",
    }).format(new Date()),
  );
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

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
          <SalesChart />
          <PaymentChart />
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
