import "server-only";

import { Prisma, type UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyActiveUsers } from "@/features/notifications/services/notification-service";

import type { ExpenseInput } from "../validations/expense-schema";
import {
  EXPENSE_ACCESS_ROLES,
  EXPENSE_DELETE_ROLES,
  EXPENSE_EDIT_ALL_ROLES,
  type ExpenseListFilters,
  type ExpenseRecord,
} from "../types";

function dateValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function todayInColombo() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function periodBoundaries() {
  const today = dateValue(todayInColombo());
  const week = new Date(today);
  week.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  const month = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  return { today: dateKey(today), week: dateKey(week), month: dateKey(month) };
}

function buildWhere(filters: ExpenseListFilters): Prisma.ExpenseWhereInput {
  return {
    ...(filters.query
      ? {
          OR: [
            { title: { contains: filters.query, mode: "insensitive" as const } },
            { referenceNumber: { contains: filters.query, mode: "insensitive" as const } },
            { remarks: { contains: filters.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          expenseDate: {
            ...(filters.dateFrom ? { gte: dateValue(filters.dateFrom) } : {}),
            ...(filters.dateTo ? { lte: dateValue(filters.dateTo) } : {}),
          },
        }
      : {}),
  };
}

function expenseOrderBy(sort: ExpenseListFilters["sort"]): Prisma.ExpenseOrderByWithRelationInput[] {
  if (sort === "oldest") return [{ expenseDate: "asc" }, { createdAt: "asc" }];
  if (sort === "amount-high") return [{ amount: "desc" }, { expenseDate: "desc" }];
  if (sort === "amount-low") return [{ amount: "asc" }, { expenseDate: "desc" }];
  return [{ expenseDate: "desc" }, { createdAt: "desc" }];
}

export async function getExpensesPage(filters: ExpenseListFilters) {
  const where = buildWhere(filters);
  const boundaries = periodBoundaries();
  const [total, today, week, month, filtered] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.aggregate({
      where: { expenseDate: dateValue(boundaries.today) },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { expenseDate: { gte: dateValue(boundaries.week), lte: dateValue(boundaries.today) } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { expenseDate: { gte: dateValue(boundaries.month), lte: dateValue(boundaries.today) } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const rows = await prisma.expense.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      amount: true,
      expenseDate: true,
      remarks: true,
      referenceNumber: true,
      createdBy: true,
      createdAt: true,
      updatedAt: true,
      creator: { select: { fullName: true } },
    },
    orderBy: expenseOrderBy(filters.sort),
    skip: (page - 1) * filters.pageSize,
    take: filters.pageSize,
  });

  const expenses: ExpenseRecord[] = rows.map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,
    amount: expense.amount.toFixed(2),
    expenseDate: dateKey(expense.expenseDate),
    remarks: expense.remarks,
    referenceNumber: expense.referenceNumber,
    createdBy: expense.createdBy,
    creatorName: expense.creator.fullName,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  }));

  return {
    expenses,
    page,
    total,
    totalPages,
    statistics: {
      today: today._sum.amount?.toFixed(2) ?? "0.00",
      week: week._sum.amount?.toFixed(2) ?? "0.00",
      month: month._sum.amount?.toFixed(2) ?? "0.00",
      filtered: filtered._sum.amount?.toFixed(2) ?? "0.00",
    },
  };
}

async function assertExpenseUser(
  tx: Prisma.TransactionClient,
  userId: string,
  allowedRoles: readonly UserRole[],
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });
  if (!user || user.status !== "ACTIVE" || !allowedRoles.includes(user.role)) {
    throw new Error("EXPENSE_ACCESS_DENIED");
  }
  return user;
}

function expenseData(input: ExpenseInput) {
  return {
    title: input.title,
    category: input.category,
    amount: new Prisma.Decimal(input.amount),
    expenseDate: dateValue(input.expenseDate),
    referenceNumber: input.referenceNumber || null,
    remarks: input.remarks || null,
  };
}

function safeLogDescription(title: string) {
  return title.replaceAll("|", "-").slice(0, 150);
}

function hasFullExpenseEditAccess(role: UserRole) {
  return (EXPENSE_EDIT_ALL_ROLES as readonly UserRole[]).includes(role);
}

export async function createExpense(input: ExpenseInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    await assertExpenseUser(tx, userId, EXPENSE_ACCESS_ROLES as readonly UserRole[]);
    const expense = await tx.expense.create({
      data: { ...expenseData(input), createdBy: userId },
      select: { id: true, title: true },
    });
    await tx.activityLog.create({
      data: {
        userId,
        action: `EXPENSE_CREATED | ${expense.id} | ${safeLogDescription(expense.title)}`,
      },
    });
    await notifyActiveUsers(tx, {
      title: "Expense created",
      message: `${expense.title} was added to expenses.`,
      type: "EXPENSE_CREATED",
      link: "/expenses",
    });
    return expense;
  });
}

export async function updateExpense(
  id: string,
  expectedUpdatedAt: string,
  input: ExpenseInput,
  userId: string,
) {
  return prisma.$transaction(async (tx) => {
    const user = await assertExpenseUser(tx, userId, EXPENSE_ACCESS_ROLES as readonly UserRole[]);
    const updatedAt = new Date();
    const result = await tx.expense.updateMany({
      where: {
        id,
        updatedAt: new Date(expectedUpdatedAt),
        ...(hasFullExpenseEditAccess(user.role) ? {} : { createdBy: userId }),
      },
      data: { ...expenseData(input), updatedAt },
    });
    if (result.count !== 1) {
      const existing = await tx.expense.findUnique({ where: { id }, select: { createdBy: true } });
      if (existing && existing.createdBy !== userId) throw new Error("EXPENSE_EDIT_DENIED");
      throw new Error(existing ? "EXPENSE_UPDATE_CONFLICT" : "EXPENSE_NOT_FOUND");
    }
    await tx.activityLog.create({
      data: {
        userId,
        action: `EXPENSE_UPDATED | ${id} | ${safeLogDescription(input.title)}`,
      },
    });
    return { id, title: input.title };
  });
}

export async function deleteExpense(id: string, expectedUpdatedAt: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    await assertExpenseUser(tx, userId, EXPENSE_DELETE_ROLES as readonly UserRole[]);
    const expense = await tx.expense.findUnique({
      where: { id },
      select: { id: true, title: true, updatedAt: true },
    });
    if (!expense) throw new Error("EXPENSE_NOT_FOUND");
    if (expense.updatedAt.getTime() !== new Date(expectedUpdatedAt).getTime()) {
      throw new Error("EXPENSE_UPDATE_CONFLICT");
    }

    await tx.activityLog.create({
      data: {
        userId,
        action: `EXPENSE_DELETED | ${expense.id} | ${safeLogDescription(expense.title)}`,
      },
    });
    await tx.expense.delete({ where: { id: expense.id } });
    return expense;
  });
}
