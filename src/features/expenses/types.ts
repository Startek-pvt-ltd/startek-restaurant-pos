import type { ExpenseCategory, ExpensePaymentMethod } from "@/generated/prisma/client";

export const EXPENSE_ACCESS_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"] as const;
export const EXPENSE_EDIT_ALL_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER"] as const;
export const EXPENSE_DELETE_ROLES = ["SUPER_ADMIN", "OWNER"] as const;

export const EXPENSE_CATEGORIES = [
  "INGREDIENTS",
  "PACKAGING",
  "GAS",
  "ELECTRICITY",
  "WATER",
  "SALARY",
  "TRANSPORT",
  "MAINTENANCE",
  "RENT",
  "MARKETING",
  "STAFF_MEALS",
  "OTHER",
] as const satisfies readonly ExpenseCategory[];

export const EXPENSE_PAYMENT_METHODS = ["CASH", "CARD", "BANK", "OTHER"] as const satisfies readonly ExpensePaymentMethod[];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  INGREDIENTS: "Ingredients",
  PACKAGING: "Packaging",
  GAS: "Gas",
  ELECTRICITY: "Electricity",
  WATER: "Water",
  SALARY: "Salary",
  TRANSPORT: "Transport",
  MAINTENANCE: "Maintenance",
  RENT: "Rent",
  MARKETING: "Marketing",
  STAFF_MEALS: "Staff Meals",
  OTHER: "Other",
};

export type ExpenseSort = "newest" | "oldest" | "amount-high" | "amount-low";

export type ExpenseListFilters = {
  query: string;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  sort: ExpenseSort;
  page: number;
  pageSize: number;
};

export type ExpenseRecord = {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: string;
  paymentMethod: ExpensePaymentMethod;
  expenseDate: string;
  remarks: string | null;
  referenceNumber: string | null;
  createdBy: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseStatistics = {
  today: string;
  week: string;
  month: string;
  filtered: string;
};

export type ExpenseActionResult =
  | { success: true; message: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };
