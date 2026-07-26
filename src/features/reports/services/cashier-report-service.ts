import "server-only";

import { prisma } from "@/lib/prisma";

import type { CashierPerformanceRecord, ReportDateRange, ReportFilters } from "../types";
import { decimal } from "../utils/report-formatters";
import { orderWhere } from "./report-query-utils";

export async function getCashierReport(filters: ReportFilters, range: ReportDateRange, exportAll = false) {
  const groups = await prisma.order.groupBy({
    by: ["cashierId", "status"], where: orderWhere(filters, range),
    _count: { _all: true }, _sum: { grandTotal: true, discount: true }, _avg: { grandTotal: true }, _max: { createdAt: true },
  });
  const ids = [...new Set(groups.map((group) => group.cashierId))];
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, fullName: true, role: true } });
  const metadata = new Map(users.map((user) => [user.id, user]));
  const combined = new Map<string, CashierPerformanceRecord>();
  for (const group of groups) {
    const user = metadata.get(group.cashierId);
    const current = combined.get(group.cashierId) ?? {
      id: group.cashierId, name: user?.fullName ?? "Former user", role: user?.role ?? "CASHIER",
      orders: 0, completed: 0, cancelled: 0, grossSales: "0.00", discounts: "0.00", averageOrderValue: "0.00", lastSale: null,
    };
    current.orders += group._count._all;
    if (group.status === "COMPLETED") {
      current.completed += group._count._all;
      current.grossSales = decimal(current.grossSales).plus(group._sum.grandTotal ?? 0).toFixed(2);
      current.discounts = decimal(current.discounts).plus(group._sum.discount ?? 0).toFixed(2);
      current.lastSale = group._max.createdAt?.toISOString() ?? current.lastSale;
    }
    if (group.status === "CANCELLED") current.cancelled += group._count._all;
    combined.set(group.cashierId, current);
  }
  let records = [...combined.values()].map((record) => ({
    ...record,
    averageOrderValue: record.completed ? decimal(record.grossSales).div(record.completed).toFixed(2) : "0.00",
  }));
  records.sort((a, b) => filters.sort === "amount-low" ? Number(a.grossSales) - Number(b.grossSales) : filters.sort === "oldest" ? a.name.localeCompare(b.name) : Number(b.grossSales) - Number(a.grossSales));
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  if (!exportAll) records = records.slice((page - 1) * filters.pageSize, page * filters.pageSize);
  return { records, total, totalPages, page };
}
