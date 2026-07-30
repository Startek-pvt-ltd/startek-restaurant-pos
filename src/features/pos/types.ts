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
  variants: PosProductVariant[];
  image: string | null;
  available: boolean;
};

export type PosProductVariant = {
  id: string;
  name: string;
  price: number;
};

export type RestaurantBillingSettings = {
  currency: string;
  printerName: string;
  printerPaperWidth: number;
  autoOpenReceiptAfterCheckout: boolean;
  autoPrintAfterCheckout: boolean;
  printLogo: boolean;
  receiptCopies: number;
  printerMode: "BROWSER" | "ESC_POS_BRIDGE";
  defaultOrderType: PosOrderType;
  allowCash: boolean;
  allowCard: boolean;
  allowQr: boolean;
  requireOrderNotes: boolean;
};

export type CartLine = PosProduct & {
  cartKey: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
};

export type CheckoutInput = {
  checkoutToken: string;
  items: Array<{ menuItemId: string; menuItemVariantId: string | null; quantity: number }>;
  orderType: PosOrderType;
  notes: string;
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
      printMode: "BROWSER" | "ESC_POS_BRIDGE";
      printSuccess: boolean;
      printMessage: string;
    }
  | { success: false; message: string };
