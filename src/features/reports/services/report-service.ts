import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { NamedChartPoint, OverviewReport, ReportDateRange, ReportFilterOptions, ReportFilters } from "../types";
import { chartByDay, decimal, moneyValue } from "../utils/report-formatters";
import { completedOrderWhere, cancelledOrderWhere, expenseWhere } from "./report-query-utils";

export async function getReportFilterOptions(): Promise<ReportFilterOptions> {
  const [cashiers, categories, menuItems] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"] } },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }),
    prisma.menuItem.findMany({ select: { id: true, name: true, categoryId: true }, orderBy: { name: "asc" } }),
  ]);
  return {
    cashiers: cashiers.map((cashier) => ({ id: cashier.id, name: cashier.fullName })),
    categories,
    menuItems,
  };
}

export async function getOverviewReport(filters: ReportFilters, range: ReportDateRange): Promise<OverviewReport> {
  const completedWhere = completedOrderWhere(filters, range);
  const cancelledWhere = cancelledOrderWhere(filters, range);
  const [sales, completedOrders, cancelledOrders, expenses, dailyRows, orderTypeGroups] = await Promise.all([
    prisma.order.aggregate({
      where: completedWhere,
      _sum: { subtotal: true, discount: true, tax: true, serviceCharge: true, grandTotal: true },
      _avg: { grandTotal: true },
    }),
    prisma.order.count({ where: completedWhere }),
    prisma.order.count({ where: cancelledWhere }),
    prisma.expense.aggregate({ where: expenseWhere(filters, range), _sum: { amount: true } }),
    prisma.order.findMany({ where: completedWhere, select: { createdAt: true, grandTotal: true }, orderBy: { createdAt: "asc" } }),
    prisma.order.groupBy({ by: ["orderType"], where: completedWhere, _sum: { grandTotal: true }, _count: { _all: true } }),
  ]);
  const netSales = decimal(sales._sum.grandTotal);
  const expenseTotal = decimal(expenses._sum.amount);
  const orderTypes: NamedChartPoint[] = orderTypeGroups.map((row) => ({
    name: row.orderType.replaceAll("_", "-"),
    value: moneyValue(row._sum.grandTotal),
    count: row._count._all,
  }));
  return {
    grossSales: moneyValue(sales._sum.subtotal),
    completedOrders,
    cancelledOrders,
    averageOrderValue: moneyValue(sales._avg.grandTotal),
    discounts: moneyValue(sales._sum.discount),
    tax: moneyValue(sales._sum.tax),
    serviceCharge: moneyValue(sales._sum.serviceCharge),
    expenses: expenseTotal.toFixed(2),
    netSales: netSales.toFixed(2),
    netRevenue: netSales.minus(expenseTotal).toFixed(2),
    dailySales: chartByDay(dailyRows.map((row) => ({ createdAt: row.createdAt, amount: row.grandTotal }))),
    orderTypes,
  };
}

export function groupSalesPeriod(rows: Array<{ createdAt: Date; grandTotal: Prisma.Decimal }>, period: "week" | "month") {
  const totals = new Map<string, Prisma.Decimal>();
  for (const row of rows) {
    const localKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).format(row.createdAt);
    let key = localKey.slice(0, 7);
    if (period === "week") {
      const date = new Date(`${localKey}T00:00:00.000Z`);
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      key = `Week of ${date.toISOString().slice(0, 10)}`;
    }
    totals.set(key, decimal(totals.get(key)).plus(row.grandTotal));
  }
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value: value.toFixed(2) }));
}
