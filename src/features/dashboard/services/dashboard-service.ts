import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductionDashboardData } from "@/features/dashboard/types";
import { APPROVED_REPORT_PAYMENT_METHODS } from "@/features/reports/types";
import { decimal, moneyValue } from "@/features/reports/utils/report-formatters";
import { parseReportFilters } from "@/features/reports/validations/report-filter-schema";
import { getActiveCashSession } from "@/features/cash-closing/services/cash-session-service";

type BestSellerRow = { id: string; name: string; quantity: number; revenue: Prisma.Decimal };

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function weeklyChart(rows: Array<{ createdAt: Date; grandTotal: Prisma.Decimal }>, start: Date, end: Date) {
  const totals = new Map<string, Prisma.Decimal>();
  for (const row of rows) {
    const key = dateKey(row.createdAt);
    totals.set(key, decimal(totals.get(key)).plus(row.grandTotal));
  }
  const result: Array<{ label: string; value: string }> = [];
  for (let cursor = new Date(start); cursor < end; cursor = new Date(cursor.getTime() + 86_400_000)) {
    const key = dateKey(cursor);
    result.push({ label: key, value: decimal(totals.get(key)).toFixed(2) });
  }
  return result;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "SY";
}

function activityLabel(value: string) {
  const withoutIds = value.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "");
  const parts = withoutIds.split("|").map((part) => part.trim()).filter(Boolean);
  const event = parts[0] ?? value;
  const orderEvent = event.match(/^(COMPLETED_ORDER|CANCELLED_ORDER)\s+(.+)$/i);
  if (orderEvent) return `${orderEvent[1]?.toLowerCase() === "completed_order" ? "Completed" : "Cancelled"} order ${orderEvent[2] ?? ""}`.trim();
  if (event === "LOGIN") return "Signed in";
  if (event === "LOGOUT") return "Signed out";
  const words = event.replaceAll("_", " ").replace(/\s+/g, " ").trim().toLowerCase();
  const label = words.charAt(0).toUpperCase() + words.slice(1);
  const detail = parts.length > 1 ? parts.at(-1) : undefined;
  const normalizedDetail = detail?.replaceAll("_", " ").replace(/\s+/g, " ").trim().toLowerCase();
  return detail && normalizedDetail !== words ? `${label}: ${detail}` : label;
}

export async function getProductionDashboard(userId: string): Promise<ProductionDashboardData> {
  const today = parseReportFilters({ preset: "today" }).range;
  const week = parseReportFilters({ preset: "this-week" }).range;
  const month = parseReportFilters({ preset: "this-month" }).range;
  const todayRange = { gte: today.orderStart, lt: today.orderEndExclusive };
  const completedToday = { status: "COMPLETED" as const, createdAt: todayRange };
  const completedMonth = { status: "COMPLETED" as const, createdAt: { gte: month.orderStart, lt: month.orderEndExclusive } };

  const [
    todaySales,
    todayOrders,
    monthSales,
    monthExpenses,
    weeklyRows,
    paymentGroups,
    orderGroups,
    recentOrders,
    bestSellerRows,
    recentExpenses,
    recentActivity,
    cashSession,
    notificationItems,
    unreadNotifications,
    restaurantCount,
    system,
    activeUsers,
    lastBackup,
  ] = await Promise.all([
    prisma.order.aggregate({ where: completedToday, _sum: { grandTotal: true } }),
    prisma.order.count({ where: { createdAt: todayRange } }),
    prisma.order.aggregate({ where: completedMonth, _sum: { grandTotal: true }, _avg: { grandTotal: true } }),
    prisma.expense.aggregate({ where: { expenseDate: { gte: month.expenseStart, lte: month.expenseEnd } }, _sum: { amount: true } }),
    prisma.order.findMany({ where: { status: "COMPLETED", createdAt: { gte: week.orderStart, lt: week.orderEndExclusive } }, select: { createdAt: true, grandTotal: true }, orderBy: { createdAt: "asc" } }),
    prisma.payment.groupBy({ by: ["paymentMethod"], where: { paymentStatus: "PAID", paymentMethod: { in: [...APPROVED_REPORT_PAYMENT_METHODS] }, order: completedToday }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.order.groupBy({ by: ["status"], where: { createdAt: todayRange }, _count: { _all: true } }),
    prisma.order.findMany({
      select: {
        id: true, orderNumber: true, orderType: true, status: true, grandTotal: true, createdAt: true,
        cashier: { select: { fullName: true } },
        payments: { select: { paymentMethod: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.$queryRaw<BestSellerRow[]>(Prisma.sql`
      SELECT item.id, item.name,
             COALESCE(SUM(line.quantity), 0)::integer AS quantity,
             COALESCE(SUM(line."totalPrice"), 0)::numeric AS revenue
      FROM "OrderItem" AS line
      INNER JOIN "Order" AS sale ON sale.id = line."orderId"
      INNER JOIN "MenuItem" AS item ON item.id = line."menuItemId"
      WHERE sale.status = 'COMPLETED'
        AND sale."createdAt" >= ${month.orderStart}
        AND sale."createdAt" < ${month.orderEndExclusive}
      GROUP BY item.id, item.name
      ORDER BY SUM(line.quantity) DESC, SUM(line."totalPrice") DESC
      LIMIT 5
    `),
    prisma.expense.findMany({ select: { id: true, title: true, category: true, amount: true, expenseDate: true }, orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }], take: 5 }),
    prisma.activityLog.findMany({ select: { id: true, action: true, createdAt: true, user: { select: { fullName: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    getActiveCashSession(),
    prisma.notification.findMany({ where: { userId }, select: { id: true, title: true, message: true, type: true, link: true, read: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.restaurant.count(),
    prisma.systemSetting.findFirst({ select: { maintenanceMode: true, printerName: true, printerPaperWidth: true }, orderBy: { id: "asc" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.backupRecord.findFirst({ select: { status: true, completedAt: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const monthRevenue = decimal(monthSales._sum.grandTotal);
  const expenses = decimal(monthExpenses._sum.amount);
  const statusCount = (status: string) => orderGroups.find((group) => group.status === status)?._count._all ?? 0;
  const completed = statusCount("COMPLETED");
  const cancelled = statusCount("CANCELLED");
  const pending = orderGroups.filter((group) => group.status !== "COMPLETED" && group.status !== "CANCELLED").reduce((sum, group) => sum + group._count._all, 0);
  const highestQuantity = Number(bestSellerRows[0]?.quantity ?? 0);

  return {
    todaySales: moneyValue(todaySales._sum.grandTotal),
    todayOrders,
    monthRevenue: monthRevenue.toFixed(2),
    averageOrder: moneyValue(monthSales._avg.grandTotal),
    monthExpenses: expenses.toFixed(2),
    netRevenue: monthRevenue.minus(expenses).toFixed(2),
    weeklySales: weeklyChart(weeklyRows, week.orderStart, week.orderEndExclusive),
    payments: APPROVED_REPORT_PAYMENT_METHODS.map((method) => {
      const group = paymentGroups.find((item) => item.paymentMethod === method);
      return { name: method, value: moneyValue(group?._sum.amount), count: group?._count._all ?? 0 };
    }),
    orderSummary: { completed, pending, cancelled, total: todayOrders },
    recentOrders: recentOrders.map((order) => ({
      id: order.id, orderNumber: order.orderNumber, orderType: order.orderType, status: order.status,
      grandTotal: order.grandTotal.toFixed(2), createdAt: order.createdAt.toISOString(),
      cashierName: order.cashier.fullName, paymentMethod: order.payments[0]?.paymentMethod ?? null,
    })),
    bestSellingItems: bestSellerRows.map((item) => ({
      id: item.id, name: item.name, quantity: Number(item.quantity), revenue: item.revenue.toFixed(2),
      progress: highestQuantity ? Math.round(Number(item.quantity) / highestQuantity * 100) : 0,
    })),
    recentExpenses: recentExpenses.map((expense) => ({ id: expense.id, title: expense.title, category: expense.category, amount: expense.amount.toFixed(2), expenseDate: expense.expenseDate.toISOString() })),
    recentActivity: recentActivity.map((activity) => {
      const user = activity.user?.fullName ?? "System";
      return { id: activity.id, user, initials: initials(user), action: activityLabel(activity.action), createdAt: activity.createdAt.toISOString() };
    }),
    cashSession: cashSession ? { id:cashSession.id,openedBy:cashSession.openedBy,openedAt:cashSession.openedAt,openingCash:cashSession.openingCash,expectedCash:cashSession.expectedCash } : null,
    notifications: {
      unreadCount: unreadNotifications,
      items: notificationItems.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    },
    health: {
      database: "OPERATIONAL", restaurantConfigured: restaurantCount > 0, maintenanceMode: system?.maintenanceMode ?? false,
      printerName: system?.printerName ?? null, printerPaperWidth: system?.printerPaperWidth ?? null, activeUsers,
      lastBackupStatus: lastBackup?.status ?? null, lastBackupAt: (lastBackup?.completedAt ?? lastBackup?.createdAt)?.toISOString() ?? null,
    },
  };
}
