import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { ExpenseReportRecord, ReportDateRange, ReportFilters } from "../types";
import { decimal, moneyValue } from "../utils/report-formatters";
import { parseReportFilters } from "../validations/report-filter-schema";
import { expenseWhere } from "./report-query-utils";

function expenseOrderBy(sort: ReportFilters["sort"]): Prisma.ExpenseOrderByWithRelationInput[] {
  if (sort === "oldest") return [{ expenseDate: "asc" }, { createdAt: "asc" }];
  if (sort === "amount-high") return [{ amount: "desc" }, { expenseDate: "desc" }];
  if (sort === "amount-low") return [{ amount: "asc" }, { expenseDate: "desc" }];
  return [{ expenseDate: "desc" }, { createdAt: "desc" }];
}

export async function getExpenseReport(filters: ReportFilters, range: ReportDateRange, exportAll = false) {
  const where = expenseWhere(filters, range);
  const todayRange = parseReportFilters({ preset: "today" }).range;
  const weekRange = parseReportFilters({ preset: "this-week" }).range;
  const monthRange = parseReportFilters({ preset: "this-month" }).range;
  const [total, filtered, today, week, month, categories, timeline] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { expenseDate: { gte: todayRange.expenseStart, lte: todayRange.expenseEnd } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { expenseDate: { gte: weekRange.expenseStart, lte: weekRange.expenseEnd } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { expenseDate: { gte: monthRange.expenseStart, lte: monthRange.expenseEnd } }, _sum: { amount: true } }),
    prisma.expense.groupBy({ by: ["category"], where, _sum: { amount: true }, _count: { _all: true } }),
    prisma.expense.findMany({ where, select: { expenseDate: true, amount: true }, orderBy: { expenseDate: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const rows = await prisma.expense.findMany({
    where,
    select: { id: true, expenseDate: true, title: true, category: true, referenceNumber: true, amount: true, creator: { select: { fullName: true } } },
    orderBy: expenseOrderBy(filters.sort),
    ...(exportAll ? {} : { skip: (page - 1) * filters.pageSize, take: filters.pageSize }),
  });
  const records: ExpenseReportRecord[] = rows.map((row) => ({
    id: row.id, date: row.expenseDate.toISOString().slice(0, 10), title: row.title, category: row.category,
    reference: row.referenceNumber, createdBy: row.creator.fullName || "Former user", amount: row.amount.toFixed(2),
  }));
  const byDay = new Map<string, Prisma.Decimal>();
  for (const row of timeline) {
    const key = row.expenseDate.toISOString().slice(0, 10);
    byDay.set(key, decimal(byDay.get(key)).plus(row.amount));
  }
  const sortedCategories = categories.sort((a, b) => decimal(b._sum.amount).comparedTo(decimal(a._sum.amount)));
  return {
    records, total, totalPages, page,
    totals: { today: moneyValue(today._sum.amount), week: moneyValue(week._sum.amount), month: moneyValue(month._sum.amount), filtered: moneyValue(filtered._sum.amount), highestCategory: sortedCategories[0]?.category ?? null },
    timeline: [...byDay.entries()].map(([label, value]) => ({ label, value: value.toFixed(2) })),
    categories: sortedCategories.map((row) => ({ name: row.category.replaceAll("_", " "), value: moneyValue(row._sum.amount), count: row._count._all })),
  };
}
