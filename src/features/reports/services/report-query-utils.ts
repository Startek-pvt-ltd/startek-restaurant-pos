import "server-only";

import { Prisma } from "@/generated/prisma/client";

import type { ReportDateRange, ReportFilters } from "../types";

export function orderWhere(filters: ReportFilters, range: ReportDateRange): Prisma.OrderWhereInput {
  return {
    createdAt: { gte: range.orderStart, lt: range.orderEndExclusive },
    ...(filters.query ? { orderNumber: { contains: filters.query, mode: "insensitive" } } : {}),
    ...(filters.cashierId ? { cashierId: filters.cashierId } : {}),
    ...(filters.orderType ? { orderType: filters.orderType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentMethod ? { payments: { some: { paymentMethod: filters.paymentMethod } } } : {}),
    ...(filters.categoryId ? { items: { some: { menuItem: { categoryId: filters.categoryId } } } } : {}),
    ...(filters.menuItemId ? { items: { some: { menuItemId: filters.menuItemId } } } : {}),
  };
}

export function completedOrderWhere(filters: ReportFilters, range: ReportDateRange): Prisma.OrderWhereInput {
  return { AND: [orderWhere(filters, range), { status: "COMPLETED" }] };
}

export function cancelledOrderWhere(filters: ReportFilters, range: ReportDateRange): Prisma.OrderWhereInput {
  return { AND: [orderWhere(filters, range), { status: "CANCELLED" }] };
}

export function expenseWhere(filters: ReportFilters, range: ReportDateRange): Prisma.ExpenseWhereInput {
  return {
    expenseDate: { gte: range.expenseStart, lte: range.expenseEnd },
    ...(filters.expenseCategory ? { category: filters.expenseCategory } : {}),
    ...(filters.query ? { OR: [
      { title: { contains: filters.query, mode: "insensitive" } },
      { referenceNumber: { contains: filters.query, mode: "insensitive" } },
      { remarks: { contains: filters.query, mode: "insensitive" } },
    ] } : {}),
  };
}
