import { z } from "zod";

import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from "../types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayInColombo() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function isCalendarDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const expenseDateSchema = z
  .string()
  .trim()
  .min(1, "Expense date is required.")
  .refine(isCalendarDate, "Enter a valid expense date.")
  .refine((value) => value <= todayInColombo(), "Future expense dates are not allowed.");

export const expenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must contain at least 2 characters.")
    .max(150, "Title cannot exceed 150 characters."),
  category: z.enum(EXPENSE_CATEGORIES, { error: "Select an expense category." }),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(?:\.\d{1,2})?$/, "Enter a valid amount with up to 2 decimal places.")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero.")
    .refine((value) => Number(value) <= 9_999_999_999.99, "Amount is too large."),
  paymentMethod: z.enum(EXPENSE_PAYMENT_METHODS, { error: "Select an expense payment method." }),
  expenseDate: expenseDateSchema,
  referenceNumber: z
    .string()
    .trim()
    .max(100, "Reference number cannot exceed 100 characters."),
  remarks: z.string().trim().max(1000, "Description cannot exceed 1,000 characters."),
});

export const expenseIdSchema = z.string().uuid("Invalid expense identifier.");

export const expenseUpdateSchema = z.object({
  id: expenseIdSchema,
  expectedUpdatedAt: z.iso.datetime({ error: "Invalid expense version." }),
  expense: expenseSchema,
});

export const expenseDeleteSchema = z.object({
  id: expenseIdSchema,
  expectedUpdatedAt: z.iso.datetime({ error: "Invalid expense version." }),
});

const optionalFilterDate = z
  .string()
  .refine(isCalendarDate, "Enter a valid filter date.")
  .optional();

export const expenseFiltersSchema = z
  .object({
    query: z.string().trim().max(100).catch(""),
    category: z.enum(EXPENSE_CATEGORIES).optional().catch(undefined),
    dateFrom: optionalFilterDate.catch(undefined),
    dateTo: optionalFilterDate.catch(undefined),
    sort: z.enum(["newest", "oldest", "amount-high", "amount-low"]).catch("newest"),
    page: z.coerce.number().int().min(1).catch(1),
    pageSize: z.coerce.number().int().refine((value) => [10, 20, 50].includes(value)).catch(10),
  })
  .superRefine((value, context) => {
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      context.addIssue({
        code: "custom",
        path: ["dateTo"],
        message: "End date must be on or after the start date.",
      });
    }
  });

export type ExpenseInput = z.infer<typeof expenseSchema>;
