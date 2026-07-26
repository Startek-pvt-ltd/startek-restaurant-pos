import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { ReportDateRange, ReportFilters, SalesRecord } from "../types";
import { chartByDay, moneyValue } from "../utils/report-formatters";
import { cancelledOrderWhere, completedOrderWhere, orderWhere } from "./report-query-utils";
import { groupSalesPeriod } from "./report-service";

function salesOrderBy(sort: ReportFilters["sort"]): Prisma.OrderOrderByWithRelationInput[] {
  if (sort === "oldest") return [{ createdAt: "asc" }];
  if (sort === "amount-high") return [{ grandTotal: "desc" }, { createdAt: "desc" }];
  if (sort === "amount-low") return [{ grandTotal: "asc" }, { createdAt: "desc" }];
  return [{ createdAt: "desc" }];
}

export async function getSalesReport(filters: ReportFilters, range: ReportDateRange, exportAll = false) {
  const where = orderWhere(filters, range);
  const completedWhere = completedOrderWhere(filters, range);
  const [total, completedTotals, cancelledOrders, chartRows, orderTypes] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.aggregate({ where: completedWhere, _sum: { subtotal: true, discount: true, tax: true, serviceCharge: true, grandTotal: true }, _count: { _all: true } }),
    prisma.order.count({ where: cancelledOrderWhere(filters, range) }),
    prisma.order.findMany({ where: completedWhere, select: { createdAt: true, grandTotal: true }, orderBy: { createdAt: "asc" } }),
    prisma.order.groupBy({ by: ["orderType"], where: completedWhere, _sum: { grandTotal: true }, _count: { _all: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true, createdAt: true, orderNumber: true, orderType: true, status: true,
      subtotal: true, discount: true, tax: true, serviceCharge: true, grandTotal: true,
      cashier: { select: { fullName: true } },
      payments: { select: { paymentMethod: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: salesOrderBy(filters.sort),
    ...(exportAll ? {} : { skip: (page - 1) * filters.pageSize, take: filters.pageSize }),
  });
  const records: SalesRecord[] = orders.map((order) => ({
    id: order.id,
    date: order.createdAt.toISOString(),
    invoice: order.orderNumber,
    cashier: order.cashier.fullName || "Former user",
    orderType: order.orderType,
    paymentMethod: order.payments[0]?.paymentMethod ?? null,
    status: order.status,
    subtotal: order.subtotal.toFixed(2), discount: order.discount.toFixed(2), tax: order.tax.toFixed(2),
    serviceCharge: order.serviceCharge.toFixed(2), grandTotal: order.grandTotal.toFixed(2),
  }));
  return {
    records, total, page, totalPages,
    totals: {
      completedOrders: completedTotals._count._all,
      cancelledOrders,
      subtotal: moneyValue(completedTotals._sum.subtotal), discount: moneyValue(completedTotals._sum.discount),
      tax: moneyValue(completedTotals._sum.tax), serviceCharge: moneyValue(completedTotals._sum.serviceCharge),
      grandTotal: moneyValue(completedTotals._sum.grandTotal),
    },
    charts: {
      daily: chartByDay(chartRows.map((row) => ({ createdAt: row.createdAt, amount: row.grandTotal }))),
      weekly: groupSalesPeriod(chartRows, "week"), monthly: groupSalesPeriod(chartRows, "month"),
      orderTypes: orderTypes.map((row) => ({ name: row.orderType.replaceAll("_", "-"), value: moneyValue(row._sum.grandTotal), count: row._count._all })),
    },
  };
}
