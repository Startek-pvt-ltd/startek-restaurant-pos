import "server-only";

import type { Prisma, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { z } from "zod";
import { OPERATIONAL_SETTINGS_ROLES, OWNER_SETTINGS_ROLES } from "../types";
import type { billingSettingsSchema, printerSettingsSchema, receiptSettingsSchema, restaurantSettingsSchema, systemPreferencesSchema } from "../validations/settings";

export async function getSettingsBundle() {
  const [restaurant, system] = await Promise.all([
    prisma.restaurant.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.systemSetting.findFirst({ orderBy: { id: "asc" } }),
  ]);
  if (!restaurant || !system) throw new Error("SETTINGS_NOT_FOUND");
  return {
    restaurant: {
      name: restaurant.name, addressLine1: restaurant.addressLine1, addressLine2: restaurant.addressLine2 ?? "", city: restaurant.city,
      phone: restaurant.phone, phone2: restaurant.phone2 ?? "", email: restaurant.email ?? "", businessRegistrationNumber: restaurant.businessRegistrationNumber ?? "",
      taxNumber: restaurant.taxNumber ?? "", logo: restaurant.logo ?? system.logo ?? "", currency: restaurant.currency, timezone: restaurant.timezone, language: restaurant.language,
    },
    billing: {
      currency: restaurant.currency, currencySymbol: system.currencySymbol, taxEnabled: system.taxEnabled, taxPercentage: Number(restaurant.taxPercentage),
      serviceChargeEnabled: system.serviceChargeEnabled, serviceChargePercentage: Number(restaurant.serviceCharge), discountEnabled: system.discountEnabled,
      maximumPercentageDiscount: Number(system.maximumPercentageDiscount), maximumFixedDiscount: Number(system.maximumFixedDiscount), defaultOrderType: system.defaultOrderType,
      allowCash: system.allowCash, allowCard: system.allowCard, allowQr: system.allowQr, requireOrderNotes: system.requireOrderNotes,
      allowNegativeBalance: false as const, invoicePrefix: system.invoicePrefix, invoiceNumberPadding: system.invoiceNumberPadding,
    },
    receipt: {
      printLogo: system.printLogo, paperWidth: system.printerPaperWidth, headerMessage: system.receiptHeaderMessage ?? "", thankYouMessage: system.receiptThankYouMessage,
      visitAgainMessage: system.receiptVisitAgainMessage, showDiscountWhenZero: system.receiptShowDiscountWhenZero, showTaxWhenZero: system.receiptShowTaxWhenZero,
      showServiceChargeWhenZero: system.receiptShowServiceWhenZero, showCashReceived: system.receiptShowCashReceived, showBalance: system.receiptShowBalance,
      showOrderType: system.receiptShowOrderType, showCashier: system.receiptShowCashier, showRestaurantPhone: system.receiptShowRestaurantPhone,
      developerCredit: system.receiptDeveloperCredit, autoOpenReceiptAfterCheckout: system.autoOpenReceiptAfterCheckout, autoPrintAfterCheckout: system.autoPrintAfterCheckout,
      receiptCopies: 1, footerText: system.receiptFooterText ?? "",
    },
    printer: {
      printerName: system.printerName, paperWidth: system.printerPaperWidth, scale: system.printerScale, margin: system.printerMargin === "MINIMUM" ? "MINIMUM" as const : "NONE" as const,
      headersFootersReminder: system.printerHeadersFootersReminder, autoOpenReceiptAfterCheckout: system.autoOpenReceiptAfterCheckout,
      autoPrintAfterCheckout: system.autoPrintAfterCheckout, printLogo: system.printLogo, receiptCopies: 1, notes: system.printerNotes ?? "",
      mode: system.printerMode === "ESC_POS_BRIDGE" ? "ESC_POS_BRIDGE" as const : "BROWSER" as const,
      automaticCut: system.printerAutomaticCut, cashDrawerEnabled: system.openCashDrawer,
      drawerOpenMode: system.printerDrawerOpenMode === "ALL_PAYMENTS" ? "ALL_PAYMENTS" as const : "CASH_ONLY" as const,
      drawerPin: system.printerDrawerPin === 1 ? 1 as const : 0 as const, drawerPulseOnMs: system.printerDrawerPulseOnMs,
      drawerPulseOffMs: system.printerDrawerPulseOffMs, showTaxLine: system.receiptShowTax, showServiceChargeLine: system.receiptShowServiceCharge,
    },
    system: {
      applicationName: system.applicationName, applicationVersion: system.applicationVersion, timezone: system.timezone, dateFormat: system.dateFormat,
      timeFormat: system.timeFormat, language: system.language, theme: "light" as const, itemsPerPage: system.itemsPerPage,
      activityLoggingEnabled: system.activityLoggingEnabled, maintenanceMode: system.maintenanceMode,
    },
  };
}

async function mutate(userId: string, roles: readonly UserRole[], action: string, task: (tx: Prisma.TransactionClient) => Promise<void>) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { status: true, role: true } });
    if (!user || user.status !== "ACTIVE" || !roles.includes(user.role)) throw new Error("SETTINGS_ACCESS_DENIED");
    await task(tx);
    await tx.activityLog.create({ data: { userId, action } });
  });
}

export async function saveRestaurantSettings(input: z.infer<typeof restaurantSettingsSchema>, userId: string, logo?: string) {
  return mutate(userId, OWNER_SETTINGS_ROLES, "UPDATED_RESTAURANT_SETTINGS", async (tx) => {
    const record = await tx.restaurant.findFirst({ select: { id: true }, orderBy: { createdAt: "asc" } }); if (!record) throw new Error("SETTINGS_NOT_FOUND");
    await tx.restaurant.update({ where: { id: record.id }, data: { ...input, email: input.email || null, addressLine2: input.addressLine2 || null, phone2: input.phone2 || null, businessRegistrationNumber: input.businessRegistrationNumber || null, taxNumber: input.taxNumber || null, address: [input.addressLine1, input.addressLine2, input.city].filter(Boolean).join("\n"), ...(logo ? { logo } : {}) } });
  });
}
export async function saveBillingSettings(input: z.infer<typeof billingSettingsSchema>, userId: string) {
  return mutate(userId, OWNER_SETTINGS_ROLES, "UPDATED_BILLING_SETTINGS", async (tx) => {
    const [r,s]=await Promise.all([tx.restaurant.findFirst({select:{id:true},orderBy:{createdAt:"asc"}}),tx.systemSetting.findFirst({select:{id:true},orderBy:{id:"asc"}})]); if(!r||!s) throw new Error("SETTINGS_NOT_FOUND");
    await tx.restaurant.update({where:{id:r.id},data:{currency:input.currency,taxPercentage:0,serviceCharge:0}});
    await tx.systemSetting.update({where:{id:s.id},data:{currency:input.currency,currencySymbol:input.currencySymbol,taxEnabled:false,serviceChargeEnabled:false,discountEnabled:false,maximumPercentageDiscount:0,maximumFixedDiscount:0,defaultOrderType:input.defaultOrderType,allowCash:input.allowCash,allowCard:input.allowCard,allowQr:input.allowQr,requireOrderNotes:input.requireOrderNotes,allowNegativeBalance:false,invoicePrefix:input.invoicePrefix,invoiceNumberPadding:input.invoiceNumberPadding}});
  });
}
export async function saveReceiptSettings(input: z.infer<typeof receiptSettingsSchema>, userId: string) {
  return mutate(userId, OPERATIONAL_SETTINGS_ROLES, "UPDATED_RECEIPT_SETTINGS", async (tx) => {
    const actor=await tx.user.findUniqueOrThrow({where:{id:userId},select:{role:true}}); const s=await tx.systemSetting.findFirst({select:{id:true},orderBy:{id:"asc"}}); if(!s) throw new Error("SETTINGS_NOT_FOUND");
    await tx.systemSetting.update({where:{id:s.id},data:{printLogo:input.printLogo,printerPaperWidth:input.paperWidth,receiptHeaderMessage:input.headerMessage||null,receiptThankYouMessage:input.thankYouMessage,receiptVisitAgainMessage:input.visitAgainMessage,receiptShowDiscountWhenZero:input.showDiscountWhenZero,receiptShowTaxWhenZero:input.showTaxWhenZero,receiptShowServiceWhenZero:input.showServiceChargeWhenZero,receiptShowCashReceived:input.showCashReceived,receiptShowBalance:input.showBalance,receiptShowOrderType:false,receiptShowCashier:input.showCashier,receiptShowRestaurantPhone:input.showRestaurantPhone,...(actor.role==="SUPER_ADMIN"?{receiptDeveloperCredit:input.developerCredit}:{}),autoOpenReceiptAfterCheckout:input.autoOpenReceiptAfterCheckout,autoPrintAfterCheckout:input.autoPrintAfterCheckout,receiptCopies:1,receiptFooterText:input.footerText||null}});
  });
}
export async function savePrinterSettings(input: z.infer<typeof printerSettingsSchema>, userId: string) {
  return mutate(userId, OPERATIONAL_SETTINGS_ROLES, "UPDATED_PRINTER_SETTINGS", async (tx) => { const s=await tx.systemSetting.findFirst({select:{id:true},orderBy:{id:"asc"}}); if(!s) throw new Error("SETTINGS_NOT_FOUND"); await tx.systemSetting.update({where:{id:s.id},data:{printerName:input.printerName,printerPaperWidth:input.paperWidth,printerScale:input.scale,printerMargin:input.margin,printerHeadersFootersReminder:input.headersFootersReminder,autoOpenReceiptAfterCheckout:input.autoOpenReceiptAfterCheckout,autoPrintAfterCheckout:input.autoPrintAfterCheckout,printLogo:input.printLogo,receiptCopies:1,printerNotes:input.notes||null,printerMode:input.mode,printerAutomaticCut:input.automaticCut,openCashDrawer:input.cashDrawerEnabled,printerDrawerOpenMode:input.drawerOpenMode,printerDrawerPin:input.drawerPin,printerDrawerPulseOnMs:input.drawerPulseOnMs,printerDrawerPulseOffMs:input.drawerPulseOffMs}}); });
}
export async function saveSystemPreferences(input: z.infer<typeof systemPreferencesSchema>, userId: string) {
  return mutate(userId, ["SUPER_ADMIN"], "UPDATED_SYSTEM_SETTINGS", async (tx) => { const s=await tx.systemSetting.findFirst({select:{id:true},orderBy:{id:"asc"}}); if(!s) throw new Error("SETTINGS_NOT_FOUND"); await tx.systemSetting.update({where:{id:s.id},data:input}); });
}
