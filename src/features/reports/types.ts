import type {
  ExpenseCategory,
  OrderStatus,
  OrderType,
  PaymentMethod,
  UserRole,
} from "@/generated/prisma/client";

export const REPORT_ACCESS_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER"] as const;
export const APPROVED_REPORT_ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "DELIVERY"] as const;
export const APPROVED_REPORT_PAYMENT_METHODS = ["CASH", "CARD", "QR"] as const;
export const APPROVED_REPORT_ORDER_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"] as const;

export type ReportPreset = "today" | "yesterday" | "this-week" | "this-month" | "last-month" | "this-year" | "custom";
export type ReportSort = "newest" | "oldest" | "amount-high" | "amount-low" | "quantity-high";

export type ReportFilters = {
  preset: ReportPreset;
  startDate?: string;
  endDate?: string;
  query: string;
  cashierId?: string;
  orderType?: OrderType;
  paymentMethod?: PaymentMethod;
  status?: OrderStatus;
  categoryId?: string;
  menuItemId?: string;
  expenseCategory?: ExpenseCategory;
  sort: ReportSort;
  page: number;
  pageSize: number;
};

export type ReportDateRange = {
  startKey: string;
  endKey: string;
  orderStart: Date;
  orderEndExclusive: Date;
  expenseStart: Date;
  expenseEnd: Date;
  label: string;
};

export type ReportFilterOptions = {
  cashiers: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  menuItems: Array<{ id: string; name: string; categoryId: string }>;
};

export type ChartPoint = { label: string; value: string; secondary?: string };
export type NamedChartPoint = { name: string; value: string; count?: number };

export type OverviewReport = {
  grossSales: string;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: string;
  discounts: string;
  tax: string;
  serviceCharge: string;
  expenses: string;
  netSales: string;
  netRevenue: string;
  dailySales: ChartPoint[];
  orderTypes: NamedChartPoint[];
};

export type SalesRecord = {
  id: string;
  date: string;
  invoice: string;
  cashier: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod | null;
  status: OrderStatus;
  subtotal: string;
  discount: string;
  tax: string;
  serviceCharge: string;
  grandTotal: string;
};

export type ItemPerformanceRecord = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  revenue: string;
  averagePrice: string;
  percentage: string;
};

export type PaymentPerformanceRecord = {
  method: PaymentMethod;
  count: number;
  revenue: string;
  average: string;
  received: string;
  change: string;
};

export type CashierPerformanceRecord = {
  id: string;
  name: string;
  role: UserRole;
  orders: number;
  completed: number;
  cancelled: number;
  grossSales: string;
  discounts: string;
  averageOrderValue: string;
  lastSale: string | null;
};

export type ExpenseReportRecord = {
  id: string;
  date: string;
  title: string;
  category: ExpenseCategory;
  reference: string | null;
  createdBy: string;
  amount: string;
};

export type ExportDataset = {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  totals: Array<[string, string]>;
  currencyColumns?: number[];
};
