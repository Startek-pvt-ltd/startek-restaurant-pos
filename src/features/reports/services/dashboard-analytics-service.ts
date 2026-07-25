import "server-only";

import { prisma } from "@/lib/prisma";

import { APPROVED_REPORT_PAYMENT_METHODS } from "../types";
import { chartByDay, decimal, moneyValue } from "../utils/report-formatters";
import { parseReportFilters } from "../validations/report-filter-schema";

export async function getDashboardAnalytics() {
  const today = parseReportFilters({ preset: "today" }).range;
  const week = parseReportFilters({ preset: "this-week" }).range;
  const month = parseReportFilters({ preset: "this-month" }).range;
  const completedToday = { status: "COMPLETED" as const, createdAt: { gte: today.orderStart, lt: today.orderEndExclusive } };
  const completedMonth = { status: "COMPLETED" as const, createdAt: { gte: month.orderStart, lt: month.orderEndExclusive } };
  const [todaySales, todayOrders, monthSales, monthExpenses, weeklyRows, paymentGroups] = await Promise.all([
    prisma.order.aggregate({ where: completedToday, _sum: { grandTotal: true }, _avg: { grandTotal: true } }),
    prisma.order.count({ where: { createdAt: { gte: today.orderStart, lt: today.orderEndExclusive } } }),
    prisma.order.aggregate({ where: completedMonth, _sum: { grandTotal: true }, _avg: { grandTotal: true } }),
    prisma.expense.aggregate({ where: { expenseDate: { gte: month.expenseStart, lte: month.expenseEnd } }, _sum: { amount: true } }),
    prisma.order.findMany({ where: { status: "COMPLETED", createdAt: { gte: week.orderStart, lt: week.orderEndExclusive } }, select: { createdAt: true, grandTotal: true }, orderBy: { createdAt: "asc" } }),
    prisma.payment.groupBy({ by: ["paymentMethod"], where: { paymentStatus: "PAID", paymentMethod: { in: [...APPROVED_REPORT_PAYMENT_METHODS] }, order: completedToday }, _sum: { amount: true }, _count: { _all: true } }),
  ]);
  const monthRevenue = decimal(monthSales._sum.grandTotal);
  const expenses = decimal(monthExpenses._sum.amount);
  return {
    todaySales: moneyValue(todaySales._sum.grandTotal), todayOrders,
    monthRevenue: monthRevenue.toFixed(2), averageOrder: moneyValue(monthSales._avg.grandTotal),
    monthExpenses: expenses.toFixed(2), netRevenue: monthRevenue.minus(expenses).toFixed(2),
    weeklySales: chartByDay(weeklyRows.map((row) => ({ createdAt: row.createdAt, amount: row.grandTotal }))),
    payments: APPROVED_REPORT_PAYMENT_METHODS.map((method) => { const group = paymentGroups.find((item) => item.paymentMethod === method); return { name: method, value: moneyValue(group?._sum.amount), count: group?._count._all ?? 0 }; }),
  };
}
