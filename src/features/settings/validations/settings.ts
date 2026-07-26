import { z } from "zod";

const text = (label: string, max = 150) => z.string().trim().min(1, `${label} is required.`).max(max);
const optional = (max = 200) => z.string().trim().max(max);
const percentage = z.number().finite().min(0).max(100);

export const restaurantSettingsSchema = z.object({
  name: text("Restaurant name"), addressLine1: text("Address"), addressLine2: optional(), city: text("City", 80),
  phone: text("Primary phone", 30), phone2: optional(30), email: z.union([z.literal(""), z.email()]),
  businessRegistrationNumber: optional(80), taxNumber: optional(80), currency: z.string().regex(/^[A-Z]{3}$/),
  timezone: z.enum(["Asia/Colombo"]), language: z.enum(["en", "si", "ta"]),
});
export const billingSettingsSchema = z.object({
  currency: z.string().regex(/^[A-Z]{3}$/), currencySymbol: text("Currency symbol", 8),
  taxEnabled: z.boolean(), taxPercentage: percentage, serviceChargeEnabled: z.boolean(),
  serviceChargePercentage: percentage, discountEnabled: z.boolean(), maximumPercentageDiscount: percentage,
  maximumFixedDiscount: z.number().finite().min(0).max(10_000_000), defaultOrderType: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  allowCash: z.boolean(), allowCard: z.boolean(), allowQr: z.boolean(), requireOrderNotes: z.boolean(),
  invoicePrefix: z.string().trim().regex(/^[A-Z0-9]{2,8}$/, "Use 2–8 uppercase letters or numbers."),
  invoiceNumberPadding: z.number().int().min(3).max(8),
}).refine((v) => v.allowCash || v.allowCard || v.allowQr, { message: "Enable at least one payment method." });
export const receiptSettingsSchema = z.object({
  printLogo: z.boolean(), paperWidth: z.union([z.literal(58), z.literal(80)]), headerMessage: optional(300),
  thankYouMessage: text("Thank-you message", 150), visitAgainMessage: optional(150),
  showDiscountWhenZero: z.boolean(), showTaxWhenZero: z.boolean(), showServiceChargeWhenZero: z.boolean(),
  showCashReceived: z.boolean(), showBalance: z.boolean(), showOrderType: z.boolean(), showCashier: z.boolean(),
  showRestaurantPhone: z.boolean(), developerCredit: text("Developer credit", 200),
  autoOpenReceiptAfterCheckout: z.boolean(), autoPrintAfterCheckout: z.boolean(), receiptCopies: z.number().int().min(1).max(3), footerText: optional(500),
});
export const printerSettingsSchema = z.object({
  printerName: text("Printer name", 100), paperWidth: z.union([z.literal(58), z.literal(80)]), scale: z.number().int().min(50).max(150),
  margin: z.enum(["NONE", "MINIMUM"]), headersFootersReminder: z.boolean(), autoOpenReceiptAfterCheckout: z.boolean(),
  autoPrintAfterCheckout: z.boolean(), printLogo: z.boolean(), receiptCopies: z.number().int().min(1).max(3), notes: optional(500),
});
export const systemPreferencesSchema = z.object({
  applicationName: text("Application name", 100), applicationVersion: text("Version", 32), timezone: z.enum(["Asia/Colombo"]),
  dateFormat: z.enum(["DD/MM/YYYY", "YYYY-MM-DD"]), timeFormat: z.enum(["12-hour", "24-hour"]),
  language: z.enum(["en", "si", "ta"]), theme: z.literal("light"), itemsPerPage: z.number().int().min(5).max(100),
  activityLoggingEnabled: z.boolean(), maintenanceMode: z.boolean(),
});
