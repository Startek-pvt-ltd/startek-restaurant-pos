import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { APPROVED_REPORT_PAYMENT_METHODS, type PaymentPerformanceRecord, type ReportDateRange, type ReportFilters } from "../types";
import { chartByDay, moneyValue } from "../utils/report-formatters";
import { completedOrderWhere } from "./report-query-utils";

export async function getPaymentReport(filters: ReportFilters, range: ReportDateRange) {
  const where: Prisma.PaymentWhereInput = {
    order: completedOrderWhere(filters, range),
    paymentStatus: "PAID",
    paymentMethod: filters.paymentMethod ?? { in: [...APPROVED_REPORT_PAYMENT_METHODS] },
  };
  const [groups, timeline] = await Promise.all([
    prisma.payment.groupBy({
      by: ["paymentMethod"], where,
      _sum: { amount: true, receivedAmount: true, changeAmount: true }, _avg: { amount: true }, _count: { _all: true },
    }),
    prisma.payment.findMany({ where, select: { createdAt: true, amount: true }, orderBy: { createdAt: "asc" } }),
  ]);
  const byMethod = new Map(groups.map((group) => [group.paymentMethod, group]));
  const records: PaymentPerformanceRecord[] = APPROVED_REPORT_PAYMENT_METHODS.map((method) => {
    const group = byMethod.get(method);
    return {
      method, count: group?._count._all ?? 0, revenue: moneyValue(group?._sum.amount), average: moneyValue(group?._avg.amount),
      received: moneyValue(group?._sum.receivedAmount), change: moneyValue(group?._sum.changeAmount),
    };
  });
  const totalRevenue = records.reduce((sum, row) => sum.plus(row.revenue), new Prisma.Decimal(0));
  const paymentCount = records.reduce((sum, row) => sum + row.count, 0);
  return {
    records,
    totalRevenue: totalRevenue.toFixed(2), paymentCount,
    averagePayment: paymentCount ? totalRevenue.div(paymentCount).toFixed(2) : "0.00",
    totalReceived: records.reduce((sum, row) => sum.plus(row.received), new Prisma.Decimal(0)).toFixed(2),
    totalChange: records.reduce((sum, row) => sum.plus(row.change), new Prisma.Decimal(0)).toFixed(2),
    distribution: records.map((row) => ({ name: row.method, value: row.revenue, count: row.count })),
    timeline: chartByDay(timeline.map((row) => ({ createdAt: row.createdAt, amount: row.amount }))),
  };
}
