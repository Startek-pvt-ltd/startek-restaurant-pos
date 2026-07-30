import type { OrderType, UserRole } from "@/generated/prisma/client";

export const SETTINGS_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER"];
export const OWNER_SETTINGS_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER"];
export const OPERATIONAL_SETTINGS_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER"];

export type ActionResult = { success: boolean; message: string };
export type RestaurantSettings = {
  name: string; addressLine1: string; addressLine2: string; city: string; phone: string;
  phone2: string; email: string; businessRegistrationNumber: string; taxNumber: string;
  logo: string; currency: string; timezone: string; language: string;
};
export type BillingSettings = {
  currency: string; currencySymbol: string; taxEnabled: boolean; taxPercentage: number;
  serviceChargeEnabled: boolean; serviceChargePercentage: number; discountEnabled: boolean;
  maximumPercentageDiscount: number; maximumFixedDiscount: number; defaultOrderType: OrderType;
  allowCash: boolean; allowCard: boolean; allowQr: boolean; requireOrderNotes: boolean;
  allowNegativeBalance: false; invoicePrefix: string; invoiceNumberPadding: number;
};
export type ReceiptSettings = {
  printLogo: boolean; paperWidth: number; headerMessage: string; thankYouMessage: string;
  visitAgainMessage: string; showDiscountWhenZero: boolean; showTaxWhenZero: boolean;
  showServiceChargeWhenZero: boolean; showCashReceived: boolean; showBalance: boolean;
  showOrderType: boolean; showCashier: boolean; showRestaurantPhone: boolean;
  developerCredit: string; autoOpenReceiptAfterCheckout: boolean; autoPrintAfterCheckout: boolean;
  receiptCopies: number; footerText: string;
};
export type PrinterSettings = {
  printerName: string; paperWidth: number; scale: number; margin: "NONE" | "MINIMUM";
  headersFootersReminder: boolean; autoOpenReceiptAfterCheckout: boolean;
  autoPrintAfterCheckout: boolean; printLogo: boolean; receiptCopies: number;
  notes: string; mode: "BROWSER" | "ESC_POS_BRIDGE"; automaticCut: boolean;
  cashDrawerEnabled: boolean; drawerOpenMode: "CASH_ONLY" | "ALL_PAYMENTS";
  drawerPin: 0 | 1; drawerPulseOnMs: number; drawerPulseOffMs: number;
  showTaxLine: boolean; showServiceChargeLine: boolean;
};
export type ReceiptPrintSettings = PrinterSettings & ReceiptSettings;
export type SystemPreferences = {
  applicationName: string; applicationVersion: string; timezone: string; dateFormat: string;
  timeFormat: string; language: string; theme: "light"; itemsPerPage: number;
  activityLoggingEnabled: boolean; maintenanceMode: boolean;
};
