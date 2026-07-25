import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { ItemPerformanceRecord, ReportDateRange, ReportFilters } from "../types";
import { decimal } from "../utils/report-formatters";
import { completedOrderWhere } from "./report-query-utils";

export async function getItemReport(filters: ReportFilters, range: ReportDateRange, exportAll = false) {
  const itemWhere: Prisma.OrderItemWhereInput = {
    order: completedOrderWhere(filters, range),
    ...(filters.categoryId ? { menuItem: { categoryId: filters.categoryId } } : {}),
    ...(filters.menuItemId ? { menuItemId: filters.menuItemId } : {}),
  };
  const groups = await prisma.orderItem.groupBy({ by: ["menuItemId"], where: itemWhere, _sum: { quantity: true, totalPrice: true } });
  const itemIds = groups.map((group) => group.menuItemId);
  const [items, availableItems] = await Promise.all([
    prisma.menuItem.findMany({ where: { id: { in: itemIds } }, select: { id: true, name: true, category: { select: { name: true } } } }),
    prisma.menuItem.findMany({
      where: { ...(filters.categoryId ? { categoryId: filters.categoryId } : {}), ...(filters.menuItemId ? { id: filters.menuItemId } : {}) },
      select: { id: true, name: true, category: { select: { name: true } } }, orderBy: { name: "asc" },
    }),
  ]);
  const metadata = new Map(items.map((item) => [item.id, item]));
  const totalRevenue = groups.reduce((sum, group) => sum.plus(group._sum.totalPrice ?? 0), new Prisma.Decimal(0));
  const allRecords: ItemPerformanceRecord[] = groups.map((group) => {
    const item = metadata.get(group.menuItemId);
    const quantity = group._sum.quantity ?? 0;
    const revenue = decimal(group._sum.totalPrice);
    return {
      id: group.menuItemId, name: item?.name ?? "Historical menu item", category: item?.category.name ?? "Uncategorized",
      quantity, revenue: revenue.toFixed(2), averagePrice: quantity ? revenue.div(quantity).toFixed(2) : "0.00",
      percentage: totalRevenue.isZero() ? "0.00" : revenue.div(totalRevenue).times(100).toFixed(2),
    };
  });
  allRecords.sort((a, b) => filters.sort === "amount-low" ? Number(a.revenue) - Number(b.revenue) : filters.sort === "oldest" ? a.name.localeCompare(b.name) : b.quantity - a.quantity || Number(b.revenue) - Number(a.revenue));
  const total = allRecords.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const records = exportAll ? allRecords : allRecords.slice((page - 1) * filters.pageSize, page * filters.pageSize);
  const soldIds = new Set(itemIds);
  const noSales = availableItems.filter((item) => !soldIds.has(item.id)).map((item) => ({ id: item.id, name: item.name, category: item.category.name }));
  const categoryTotals = new Map<string, Prisma.Decimal>();
  for (const record of allRecords) categoryTotals.set(record.category, decimal(categoryTotals.get(record.category)).plus(record.revenue));
  const allSorted = [...groups].sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0));
  return {
    records, total, page, totalPages, noSales,
    totalRevenue: totalRevenue.toFixed(2), totalQuantity: groups.reduce((sum, group) => sum + (group._sum.quantity ?? 0), 0),
    top: allSorted.slice(0, 10).map((group) => ({ name: metadata.get(group.menuItemId)?.name ?? "Historical item", value: String(group._sum.quantity ?? 0) })),
    least: allSorted.slice(-10).reverse().map((group) => ({ name: metadata.get(group.menuItemId)?.name ?? "Historical item", value: String(group._sum.quantity ?? 0) })),
    categories: [...categoryTotals.entries()].map(([name, value]) => ({ name, value: value.toFixed(2) })),
  };
}
