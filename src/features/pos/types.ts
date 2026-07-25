export type PosOrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type PosPaymentMethod = "CASH" | "CARD" | "QR";
export type DiscountType = "PERCENTAGE" | "FIXED";

export type PosCategory = {
  id: string;
  name: string;
  itemCount: number;
};

export type PosProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
};

export type RestaurantBillingSettings = {
  currency: string;
  taxPercentage: number;
  serviceChargePercentage: number;
  printerName: string;
  printerPaperWidth: number;
  autoOpenReceiptAfterCheckout: boolean;
  autoPrintAfterCheckout: boolean;
  printLogo: boolean;
  receiptCopies: number;
};

export type CartLine = PosProduct & {
  quantity: number;
};

export type CheckoutInput = {
  items: Array<{ menuItemId: string; quantity: number }>;
  orderType: PosOrderType;
  notes: string;
  discountType: DiscountType;
  discountValue: number;
  paymentMethod: PosPaymentMethod;
  amountReceived: number | null;
};

export type CheckoutResult =
  | {
      success: true;
      message: string;
      orderId: string;
      orderNumber: string;
      grandTotal: number;
      balance: number;
    }
  | { success: false; message: string };
