import { z } from "zod";

import { EXPENSE_CATEGORIES } from "@/features/expenses/types";

import {
  APPROVED_REPORT_ORDER_STATUSES,
  APPROVED_REPORT_ORDER_TYPES,
  APPROVED_REPORT_PAYMENT_METHODS,
  type ReportDateRange,
  type ReportFilters,
} from "../types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function colomboToday() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthStart(value: string) { return `${value.slice(0, 7)}-01`; }
function yearStart(value: string) { return `${value.slice(0, 4)}-01-01`; }

const optionalDate = z.string().refine(isDate, "Enter a valid date.").optional().catch(undefined);
const optionalUuid = z.string().uuid().optional().catch(undefined);

export const reportFilterSchema = z.object({
  preset: z.enum(["today", "yesterday", "this-week", "this-month", "last-month", "this-year", "custom"]).catch("this-month"),
  startDate: optionalDate,
  endDate: optionalDate,
  query: z.string().trim().max(100).catch(""),
  cashierId: optionalUuid,
  orderType: z.enum(APPROVED_REPORT_ORDER_TYPES).optional().catch(undefined),
  paymentMethod: z.enum(APPROVED_REPORT_PAYMENT_METHODS).optional().catch(undefined),
  status: z.enum(APPROVED_REPORT_ORDER_STATUSES).optional().catch(undefined),
  categoryId: optionalUuid,
  menuItemId: optionalUuid,
  expenseCategory: z.enum(EXPENSE_CATEGORIES).optional().catch(undefined),
  sort: z.enum(["newest", "oldest", "amount-high", "amount-low", "quantity-high"]).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().refine((value) => [10, 20, 50].includes(value)).catch(10),
});

export function parseReportFilters(input: Record<string, string | undefined>): {
  filters: ReportFilters;
  range: ReportDateRange;
  error?: string;
} {
  const filters = reportFilterSchema.parse(input);
  const today = colomboToday();
  let startKey = today;
  let endKey = today;
  let error: string | undefined;

  if (filters.preset === "yesterday") startKey = endKey = shiftDate(today, -1);
  if (filters.preset === "this-week") {
    const current = new Date(`${today}T00:00:00.000Z`);
    startKey = shiftDate(today, -((current.getUTCDay() + 6) % 7));
  }
  if (filters.preset === "this-month") startKey = monthStart(today);
  if (filters.preset === "last-month") {
    const first = new Date(`${monthStart(today)}T00:00:00.000Z`);
    first.setUTCMonth(first.getUTCMonth() - 1);
    startKey = first.toISOString().slice(0, 10);
    first.setUTCMonth(first.getUTCMonth() + 1);
    first.setUTCDate(0);
    endKey = first.toISOString().slice(0, 10);
  }
  if (filters.preset === "this-year") startKey = yearStart(today);
  if (filters.preset === "custom") {
    if (!filters.startDate || !filters.endDate) {
      error = "Choose both a start date and an end date for a custom range.";
      startKey = monthStart(today);
    } else {
      startKey = filters.startDate;
      endKey = filters.endDate;
    }
  }

  const minimum = "2000-01-01";
  if (startKey > endKey) error = "Start date cannot be after end date.";
  if (startKey < minimum || endKey > today) error = "Report dates must be between 1 January 2000 and today.";
  const span = Math.round((Date.parse(endKey) - Date.parse(startKey)) / 86_400_000);
  if (span > 1_831) error = "Report ranges cannot exceed five years.";
  if (error) {
    startKey = monthStart(today);
    endKey = today;
  }

  return {
    filters,
    range: {
      startKey,
      endKey,
      orderStart: new Date(`${startKey}T00:00:00.000+05:30`),
      orderEndExclusive: new Date(`${shiftDate(endKey, 1)}T00:00:00.000+05:30`),
      expenseStart: new Date(`${startKey}T00:00:00.000Z`),
      expenseEnd: new Date(`${endKey}T00:00:00.000Z`),
      label: `${startKey} to ${endKey}`,
    },
    error,
  };
}

export function searchParamsInput(raw: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
}
