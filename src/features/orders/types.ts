export const ORDER_ACCESS_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"] as const;
export const ORDER_CANCEL_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER"] as const;

export type OrderTypeFilter = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type OrderStatusFilter = "PENDING" | "COMPLETED" | "CANCELLED";
export type PaymentMethodFilter = "CASH" | "CARD" | "QR";
export type PaymentStatusFilter = "PENDING" | "PAID" | "REFUNDED";
export type OrderSort = "newest" | "oldest";

export type OrderListFilters = {
  query: string;
  dateFrom?: string;
  dateTo?: string;
  orderType?: OrderTypeFilter;
  paymentMethod?: PaymentMethodFilter;
  paymentStatus?: PaymentStatusFilter;
  status?: OrderStatusFilter;
  sort: OrderSort;
  page: number;
  pageSize: number;
};

export type OrderListRecord = {
  id: string;
  orderNumber: string;
  createdAt: string;
  orderType: OrderTypeFilter;
  cashierName: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  status: string;
  grandTotal: string;
};

export type OrderStatistics = {
  ordersToday: number;
  completedToday: number;
  pendingOrders: number;
  cancelledToday: number;
  totalSalesToday: string;
};

export type OrderDetailRecord = {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  orderType: string;
  status: string;
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cashierName: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    notes: string | null;
  }>;
  subtotal: string;
  discount: string;
  tax: string;
  serviceCharge: string;
  grandTotal: string;
  payment: {
    paymentMethod: string;
    paymentStatus: string;
    amount: string;
    receivedAmount: string | null;
    balance: string | null;
    reference: string | null;
  } | null;
  restaurant: {
    name: string;
    address: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    phone: string;
    phone2: string | null;
    email: string | null;
    taxNumber: string | null;
    logo: string | null;
    currency: string;
    receiptFooter: string | null;
  };
};

export type OrderActionResult =
  | { success: true; message: string }
  | { success: false; message: string };
