import "server-only";

import { EXPENSE_CATEGORY_LABELS } from "@/features/expenses/types";
import { prisma } from "@/lib/prisma";

import { formatReportDate, formatReportDateTime, formatReportMoney } from "../utils/report-formatters";
import { parseReportFilters } from "../validations/report-filter-schema";

const orderTypes = { DINE_IN: "Dine-in", TAKEAWAY: "Takeaway", DELIVERY: "Delivery" };
const statuses = {
  PENDING: "Pending", CONFIRMED: "Confirmed", PREPARING: "Preparing",
  READY: "Ready", COMPLETED: "Completed", CANCELLED: "Cancelled",
} as const;
const activityLabels = {
  COMPLETED_ORDER: "Completed an order",
  CANCELLED_ORDER: "Cancelled an order",
  EXPENSE_CREATED: "Recorded an expense",
} as const;

export async function getDashboardActivity() {
  const { range } = parseReportFilters({ preset: "today" });
  const [orders, expenses, activity, bestSellers] = await Promise.all([
    prisma.order.findMany({
      take: 5,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true, orderNumber: true, orderType: true, status: true, grandTotal: true, createdAt: true,
        cashier: { select: { fullName: true } },
        payments: { take: 1, orderBy: { createdAt: "desc" }, select: { paymentMethod: true } },
      },
    }),
    prisma.expense.findMany({
      take: 5,
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, category: true, expenseDate: true, amount: true },
    }),
    prisma.activityLog.findMany({
      take: 5,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      where: { OR: Object.keys(activityLabels).map((action) => ({ action: { startsWith: action + " " } })) },
      select: { id: true, action: true, createdAt: true, user: { select: { fullName: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: { order: { status: "COMPLETED", createdAt: { gte: range.orderStart, lt: range.orderEndExclusive } } },
      _sum: { quantity: true, totalPrice: true },
      orderBy: [{ _sum: { quantity: "desc" } }, { menuItemId: "asc" }],
      take: 5,
    }),
  ]);
  const names = await prisma.menuItem.findMany({
    where: { id: { in: bestSellers.map((item) => item.menuItemId) } },
    select: { id: true, name: true },
  });
  const leadingQuantity = bestSellers[0]?._sum.quantity || 1;
  return {
    orders: orders.map((order) => ({
      id: order.id, invoice: order.orderNumber, orderType: orderTypes[order.orderType],
      cashier: order.cashier.fullName, payment: order.payments[0]?.paymentMethod ?? "—",
      status: statuses[order.status], amount: formatReportMoney(order.grandTotal.toString()),
      time: formatReportDateTime(order.createdAt),
    })),
    expenses: expenses.map((expense) => ({
      id: expense.id, title: expense.title, category: EXPENSE_CATEGORY_LABELS[expense.category],
      date: formatReportDate(expense.expenseDate), amount: formatReportMoney(expense.amount.toString()),
    })),
    activities: activity.map((entry) => {
      const user = entry.user?.fullName ?? "System";
      const action = entry.action.split(" ", 1)[0] as keyof typeof activityLabels;
      return {
        id: entry.id, user, initials: user.split(/\s+/).slice(0, 2).map((part) => part[0]).join(""),
        action: activityLabels[action], time: formatReportDateTime(entry.createdAt),
      };
    }),
    items: bestSellers.map((item) => ({
      id: item.menuItemId, name: names.find((name) => name.id === item.menuItemId)?.name ?? "Menu item",
      quantity: item._sum.quantity ?? 0, revenue: formatReportMoney(item._sum.totalPrice?.toString() ?? "0"),
      progress: ((item._sum.quantity ?? 0) / leadingQuantity) * 100,
    })),
  };
}
