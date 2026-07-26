import type { CashSessionStatus, UserRole } from "@/generated/prisma/client";

export const CASH_SESSION_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"];
export const CASH_SESSION_MANAGEMENT_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER"];

export type CashDifferenceStatus = "EXACT" | "OVER" | "SHORT";

export type CashSessionSummary = {
  id: string;
  status: CashSessionStatus;
  openedById: string;
  openedBy: string;
  closedBy: string | null;
  openingCash: string;
  openingNote: string | null;
  openedAt: string;
  closedAt: string | null;
  cashSales: string;
  cardSales: string;
  qrSales: string;
  totalSales: string;
  cashExpenses: string;
  totalExpenses: string;
  expectedCash: string;
  actualCash: string | null;
  cashDifference: string | null;
  differenceStatus: CashDifferenceStatus | null;
  notes: string | null;
};

export type CashSessionFilters = {
  query: string;
  dateFrom?: string;
  dateTo?: string;
  staffId?: string;
  difference?: CashDifferenceStatus;
  page: number;
  pageSize: number;
};

export type CashSessionActionResult =
  | { success: true; message: string; sessionId: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };
