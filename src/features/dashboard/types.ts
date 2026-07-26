import type { BackupStatus, NotificationType, OrderStatus, OrderType, PaymentMethod } from "@/generated/prisma/client";

export type DashboardOrder = {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  grandTotal: string;
  createdAt: string;
  cashierName: string;
  paymentMethod: PaymentMethod | null;
};

export type DashboardBestSeller = {
  id: string;
  name: string;
  quantity: number;
  revenue: string;
  progress: number;
};

export type DashboardExpense = {
  id: string;
  title: string;
  category: string;
  amount: string;
  expenseDate: string;
};

export type DashboardActivity = {
  id: string;
  user: string;
  initials: string;
  action: string;
  createdAt: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type DashboardHealth = {
  database: "OPERATIONAL";
  restaurantConfigured: boolean;
  maintenanceMode: boolean;
  printerName: string | null;
  printerPaperWidth: number | null;
  activeUsers: number;
  lastBackupStatus: BackupStatus | null;
  lastBackupAt: string | null;
};

export type ProductionDashboardData = {
  todaySales: string;
  todayOrders: number;
  monthRevenue: string;
  averageOrder: string;
  monthExpenses: string;
  netRevenue: string;
  weeklySales: Array<{ label: string; value: string }>;
  payments: Array<{ name: string; value: string; count: number }>;
  orderSummary: { completed: number; pending: number; cancelled: number; total: number };
  recentOrders: DashboardOrder[];
  bestSellingItems: DashboardBestSeller[];
  recentExpenses: DashboardExpense[];
  recentActivity: DashboardActivity[];
  cashSession: {
    id: string;
    openedBy: string;
    openedAt: string;
    openingCash: string;
    expectedCash: string;
  } | null;
  notifications: { unreadCount: number; items: DashboardNotification[] };
  health: DashboardHealth;
};
